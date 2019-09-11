import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  AuthStatus,
  FlowInfo,
  OAuthCredentials,
  OAuthFlow,
  ScopesInfo,
  SecurityCredentials,
  SecurityRequirementStatus,
  SecuritySchemeItem
} from '../models/openapi-viewer.model';
import { OpenAPIObject, SecurityRequirementObject, SecuritySchemeObject } from 'openapi3-ts';
import { securitySchemeTypesWithScopes } from '../openapi-viewer.constants';
import { parseQueryString, serializeQueryParams } from '../util/data-generator.util';

@Injectable()
export class OpenapiAuthService {
  readonly securitySchemes = new BehaviorSubject<SecuritySchemeItem[]>([]);
  /**
   * Emits with the scheme name when its credentials have been updated
   */
  readonly updatedCredentials = new Subject<string>();

  private globalRequirements: SecurityRequirementObject[] = [];

  constructor(private zone: NgZone) {}

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

  runOAuthAuthorization(name: string, credentials: OAuthCredentials, redirectUri: string) {
    const schema = this.getSchema(name);
    if (!schema || !credentials) {
      return null;
    }
    schema.credentials = credentials;
    schema.remember = true;
    writeCredentialsStore(name, credentials);

    const url = buildAuthorizationUrl(schema.securityScheme, credentials, redirectUri, name);
    console.log('authorization url', url);
    const service = this;
    (window as any).handleOAuthCallback = fragment => {
      service.zone.run(() => {
        service.handleOAuthCallback(fragment);
      });
    };
    window.open(url, '_blank');
  }

  /**
   * @param fragment
   * eg. access_token=8c665834-6a43-4704-81d3-42d311a1ab91&token_type=bearer&expires_in=20&scope=read%20write:pets%20write%20read:pets
   */
  handleOAuthCallback(fragment: string) {
    if (window.opener && window.opener.handleOAuthCallback) {
      window.opener.handleOAuthCallback(fragment);
      window.close();
      return;
    }
    const params = parseQueryString(fragment);
    if (!params.state) {
      return;
    }
    const schema = this.getSchema(params.state);
    if (!schema || !schema.credentials) {
      return;
    }
    const credentials = schema.credentials as OAuthCredentials;
    credentials.token = {
      access_token: params.access_token,
      token_type: params.token_type
    };
    if (params.expires_in) {
      credentials.token.expires_at = new Date().getTime() + parseInt(params.expires_in, 10) * 1000;
    }
    console.log('updated credentials', credentials);

    this.updateCredentials(schema.name, credentials, true, true);
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

export function buildAuthorizationUrl(scheme: SecuritySchemeObject, credentials: OAuthCredentials, redirectUri: string, state?: string) {
  const baseUrl = getAuthorizationBaseUrl(scheme, credentials.flow);
  const params: Record<string, string> = {
    client_id: credentials.clientId,
    redirect_uri: redirectUri
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
