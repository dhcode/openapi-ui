import { Injectable, NgZone, Optional } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import {
  AuthStatus,
  FlowInfo,
  OAuthCredentials,
  OAuthFlow,
  OAuthToken,
  ScopesInfo,
  SecurityCredentials,
  SecurityRequirementStatus,
  SecuritySchemeItem
} from '../models/openapi-viewer.model';
import { OpenAPIObject, SecurityRequirementObject, SecuritySchemeObject } from 'openapi3-ts';
import { securitySchemeTypesWithScopes } from '../openapi-viewer.constants';
import { serializeQueryParams } from '../util/data-generator.util';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class OpenapiAuthService {
  readonly securitySchemes = new BehaviorSubject<SecuritySchemeItem[]>([]);
  /**
   * Emits with the scheme name when its credentials have been updated
   */
  readonly updatedCredentials = new Subject<string>();

  private globalRequirements: SecurityRequirementObject[] = [];

  currentWindow = window;

  constructor(private zone: NgZone, @Optional() private http: HttpClient) {}

  identifySchemes(spec: OpenAPIObject) {
    this.securitySchemes.next(getSecurityInformation(spec));
    if (Array.isArray(spec.security)) {
      this.globalRequirements = spec.security;
    }
  }

  getAllRequirements(requirement?: SecurityRequirementObject[]): SecurityRequirementObject[] {
    return [...this.globalRequirements, ...(requirement || [])].filter(reqObject => Object.keys(reqObject).length > 0);
  }

  getRequiredSchemes(requirement?: SecurityRequirementObject[]): SecurityRequirementStatus[][] {
    const result: SecurityRequirementStatus[][] = [];
    for (const reqs of this.getAllRequirements(requirement)) {
      result.push(
        Object.keys(reqs).map(reqName => {
          const schemaItem = this.getSchema(reqName);
          return {
            name: reqName,
            scopes: reqs[reqName],
            securityScheme: schemaItem.securityScheme,
            authenticated: schemaItem.authenticated
          };
        })
      );
    }
    return result;
  }

  getAuthStatus(requirements: SecurityRequirementObject[]): AuthStatus {
    let authStatus: AuthStatus = 'none';
    const allRequirements = this.getAllRequirements(requirements);
    if (allRequirements && Object.keys(allRequirements).length) {
      authStatus = 'required';
      if (this.hasAnyAuthorization(allRequirements)) {
        authStatus = 'ok';
      }
    }
    return authStatus;
  }

  hasAnyAuthorization(requirements: SecurityRequirementObject[]): boolean {
    if (!requirements || !requirements.length) {
      return true;
    }
    // one needs to be fulfilled
    for (const req of requirements) {
      const reqNames = Object.keys(req);
      if (reqNames.length && reqNames.every(rn => this.hasRequirement(rn, req[rn]))) {
        return true;
      }
    }
    return false;
  }

  hasRequirement(reqName, scopes: string[]): boolean {
    const scheme = this.getSchema(reqName);
    if (
      scheme &&
      scheme.authenticated &&
      scheme.securityScheme.type &&
      securitySchemeTypesWithScopes.includes(scheme.securityScheme.type)
    ) {
      const credentials = scheme.credentials as OAuthCredentials;
      if (credentials && credentials.scopes && scopes.every(s => credentials.scopes.includes(s))) {
        return true;
      }
    } else if (scheme && scheme.authenticated) {
      return true;
    }
    return false;
  }

  getSchema(name: string): SecuritySchemeItem {
    return this.securitySchemes.value.find(s => s.name === name);
  }

  updateCredentials(name: string, credentials: SecurityCredentials, authenticated: boolean, remember = false) {
    if (typeof name !== 'string' || !name.length) {
      throw new Error('No credentials name given');
    }
    const schema = this.getSchema(name);
    schema.authenticated = authenticated;
    if (schema.authenticated) {
      schema.credentials = credentials;
      if (remember) {
        schema.remember = true;
        writeCredentialsStore(name, credentials);
      }
    } else {
      schema.remember = false;
      schema.credentials = null;
      clearCredentialsStore(name);
    }
    this.updatedCredentials.next(name);
  }

  runOAuthAuthorization(name: string, credentials: OAuthCredentials): Observable<boolean> {
    const scheme = this.getSchema(name);
    if (!scheme || !credentials) {
      return throwError(new Error('Unknown scheme or no credentials given'));
    }
    scheme.credentials = credentials;
    scheme.remember = true;
    writeCredentialsStore(name, credentials);

    if (credentials.flow === 'implicit' || credentials.flow === 'authorizationCode') {
      return new Observable<boolean>(subscriber => {
        const url = buildAuthorizationUrl(scheme.securityScheme, credentials, name);
        const service = this;
        (this.currentWindow as any).handleOAuthCallback = fragment => {
          // called from other window
          return service.zone.run(() =>
            service.handleOAuthCallback(fragment).then(
              () => {
                subscriber.next(true);
                subscriber.complete();
              },
              err => {
                subscriber.error(err);
              }
            )
          );
        };
        this.currentWindow.open(url, '_blank');
      });
    }
    if (credentials.flow === 'clientCredentials') {
      const tokenUrl = getTokenBaseUrl(scheme.securityScheme, 'clientCredentials');
      return this.requestToken(tokenUrl, 'client_credentials', credentials).pipe(
        map(token => {
          credentials.token = token;
          this.updateCredentials(name, credentials, true, true);
          return true;
        })
      );
    }
    if (credentials.flow === 'password') {
      const tokenUrl = getTokenBaseUrl(scheme.securityScheme, 'password');
      return this.requestToken(tokenUrl, 'password', credentials).pipe(
        map(token => {
          credentials.token = token;
          this.updateCredentials(name, credentials, true, true);
          return true;
        })
      );
    }
    return throwError(new Error('Unknown flow'));
  }

  /**
   * @param params
   * eg. access_token=8c665834-6a43-4704-81d3-42d311a1ab91&token_type=bearer&expires_in=20&scope=read%20write:pets%20write%20read:pets
   */
  async handleOAuthCallback(params: Record<string, string>) {
    if (this.currentWindow.opener && this.currentWindow.opener.handleOAuthCallback) {
      await this.currentWindow.opener.handleOAuthCallback(params);
      this.currentWindow.close();
      return;
    }
    if (!params.state) {
      return;
    }
    const scheme = this.getSchema(params.state);
    if (!scheme || !scheme.credentials) {
      return;
    }
    const credentials = scheme.credentials as OAuthCredentials;
    if (params.access_token) {
      return this.updateByImplicitFlow(scheme.name, credentials, params);
    }
    if (params.code) {
      return await this.updateByCodeFlow(scheme, credentials, params);
    }
  }

  private updateByImplicitFlow(name: string, credentials: OAuthCredentials, params: Record<string, string>) {
    credentials.token = {
      access_token: params.access_token,
      token_type: params.token_type
    };
    if (params.expires_in) {
      credentials.token.expires_at = new Date().getTime() + parseInt(params.expires_in, 10) * 1000;
    }
    this.updateCredentials(name, credentials, true, true);
  }

  private async updateByCodeFlow(scheme: SecuritySchemeItem, credentials: OAuthCredentials, params: Record<string, string>) {
    const tokenUrl = getTokenBaseUrl(scheme.securityScheme, 'authorizationCode');
    credentials.token = await this.requestToken(tokenUrl, 'authorization_code', credentials, params.code).toPromise();
    this.updateCredentials(name, credentials, true, true);
  }

  /**
   * Updates the provided credentials with a token
   */
  private requestToken(tokenUrl: string, grantType: string, credentials: OAuthCredentials, code?: string): Observable<OAuthToken> {
    const tokenRequest: any = {
      grant_type: grantType,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret
    };
    if (grantType === 'authorization_code') {
      tokenRequest.code = code;
      tokenRequest.redirect_uri = credentials.redirectUri;
    }
    if (grantType === 'password') {
      tokenRequest.username = credentials.username;
      tokenRequest.password = credentials.password;
    }
    if (!this.http) {
      throw new Error('No http client provider available.');
    }
    return this.http
      .post<Record<string, string>>(tokenUrl, serializeQueryParams(tokenRequest), {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }
      })
      .pipe(
        map(result => {
          if (result && result.access_token) {
            const token: OAuthToken = {
              access_token: result.access_token,
              token_type: result.token_type,
              id_token: result.id_token,
              refresh_token: result.refresh_token
            };
            if (result.expires_in) {
              token.expires_at = new Date().getTime() + parseInt(result.expires_in, 10) * 1000;
            }
            return token;
          } else {
            throw new Error('Missing access token in response from token endpoint ' + tokenUrl);
          }
        })
      );
  }

  removeToken(name: string) {
    const schema = this.getSchema(name);
    if (!schema || !schema.credentials) {
      return;
    }
    (schema.credentials as OAuthCredentials).token = null;
    schema.authenticated = false;
    writeCredentialsStore(name, schema.credentials);
    this.updatedCredentials.next(name);
  }
}

function clearCredentialsStore(name: string) {
  const key = getStorageKey(name);
  window.sessionStorage.removeItem(key);
}

function writeCredentialsStore(name: string, credentials: SecurityCredentials) {
  const key = getStorageKey(name);
  const value = JSON.stringify(credentials);
  window.sessionStorage.setItem(key, value);
}

function readCredentialsStore(name: string): SecurityCredentials | null {
  const key = getStorageKey(name);
  const value = window.sessionStorage.getItem(key);
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.warn('Failed to parse credentials for ' + name, e);
    }
  }
  return null;
}

function getStorageKey(name: string) {
  return 'oavCredentials.' + name.replace(/[^-_A-Za-z0-9]/g, '_');
}

function getSecurityInformation(spec: OpenAPIObject) {
  const securitySchemes: SecuritySchemeItem[] = [];
  const definitions = spec.securityDefinitions || (spec.components && spec.components.securitySchemes) || {};
  for (const [schemeName, schemeDef] of Object.entries(definitions)) {
    const storedCredentials = readCredentialsStore(schemeName);
    securitySchemes.push({
      name: schemeName,
      securityScheme: schemeDef as SecuritySchemeObject,
      authenticated: storedCredentials !== null,
      remember: storedCredentials !== null,
      credentials: storedCredentials
    });
  }

  return securitySchemes;
}

export function identifyFlows(scheme: SecuritySchemeObject): FlowInfo[] {
  const results: FlowInfo[] = [];
  // V2
  if (scheme.flow) {
    let flowName = scheme.flow;
    if (flowName === 'application') {
      flowName = 'clientCredentials';
    }
    if (flowName === 'accessCode') {
      flowName = 'authorizationCode';
    }
    results.push({
      flow: flowName,
      scopes: toScopesInfo(scheme.scopes)
    });
  }
  if (scheme.flows) {
    if (scheme.flows.implicit) {
      results.push({
        flow: 'implicit',
        scopes: toScopesInfo(scheme.flows.implicit.scopes)
      });
    }
    if (scheme.flows.password) {
      results.push({
        flow: 'password',
        scopes: toScopesInfo(scheme.flows.password.scopes)
      });
    }
    if (scheme.flows.clientCredentials) {
      results.push({
        flow: 'clientCredentials',
        scopes: toScopesInfo(scheme.flows.clientCredentials.scopes)
      });
    }
    if (scheme.flows.authorizationCode) {
      results.push({
        flow: 'authorizationCode',
        scopes: toScopesInfo(scheme.flows.authorizationCode.scopes)
      });
    }
  }
  return results;
}

function toScopesInfo(scopes: Record<string, string>): ScopesInfo[] {
  if (!scopes) {
    return [];
  }
  return Object.keys(scopes).map(name => ({ scope: name, description: scopes[name] }));
}

export function getAuthorizationBaseUrl(scheme: SecuritySchemeObject, flow: OAuthFlow | 'application' | 'accessCode') {
  if (scheme.type === 'oauth2' && (scheme.flow === 'implicit' || scheme.flow === 'accessCode')) {
    return scheme.authorizationUrl;
  }
  if (scheme.type === 'oauth2' && scheme.flows && scheme.flows[flow]) {
    return scheme.flows[flow].authorizationUrl;
  }
  return null;
}

export function getTokenBaseUrl(scheme: SecuritySchemeObject, flow: OAuthFlow | 'application' | 'accessCode') {
  if (scheme.type === 'oauth2' && scheme.flow === 'accessCode') {
    return scheme.tokenUrl;
  }
  if (scheme.type === 'oauth2' && scheme.flows && scheme.flows[flow]) {
    return scheme.flows[flow].tokenUrl;
  }
  return null;
}

export function buildAuthorizationUrl(scheme: SecuritySchemeObject, credentials: OAuthCredentials, state?: string) {
  const baseUrl = getAuthorizationBaseUrl(scheme, credentials.flow);
  const params: Record<string, string> = {
    client_id: credentials.clientId,
    redirect_uri: credentials.redirectUri
  };
  if (credentials.flow === 'implicit') {
    params.response_type = 'token';
    params.nonce = credentials.nonce;
  }
  if (credentials.flow === 'authorizationCode') {
    params.response_type = 'code';
  }
  if (state) {
    params.state = state;
  }
  return baseUrl + '?' + serializeQueryParams(params);
}
