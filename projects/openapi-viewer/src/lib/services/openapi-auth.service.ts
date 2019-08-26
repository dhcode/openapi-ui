import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  AuthStatus,
  OAuthCredentials,
  SecurityCredentials,
  SecurityRequirementStatus,
  SecuritySchemeItem
} from '../models/openapi-viewer.model';
import { OpenAPIObject, SecurityRequirementObject, SecuritySchemeObject } from 'openapi3-ts';
import { securitySchemeTypesWithScopes } from '../openapi-viewer.constants';

@Injectable()
export class OpenapiAuthService {
  readonly securitySchemes = new BehaviorSubject<SecuritySchemeItem[]>([]);
  /**
   * Emits with the scheme name when its credentials have been updated
   */
  readonly updatedCredentials = new Subject<string>();

  private globalRequirements: SecurityRequirementObject[] = [];

  constructor() {}

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
