import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthStatus, OAuthCredentials, SecuritySchemeItem } from '../models/openapi-viewer.model';
import { OpenAPIObject, SecurityRequirementObject, SecuritySchemeObject } from 'openapi3-ts';
import { securitySchemeTypesWithScopes } from '../openapi-viewer.constants';

@Injectable()
export class OpenapiAuthService {
  securitySchemes = new BehaviorSubject<SecuritySchemeItem[]>([]);

  constructor() {}

  identifySchemes(spec: OpenAPIObject) {
    this.securitySchemes.next(getSecurityInformation(spec));
  }

  getAuthStatus(requirement: SecurityRequirementObject[]): AuthStatus {
    let authStatus: AuthStatus = 'none';
    if (requirement && Object.keys(requirement).length) {
      authStatus = 'required';
      if (this.hasAnyAuthorization(requirement)) {
        authStatus = 'ok';
      }
    }
    return authStatus;
  }

  hasAnyAuthorization(requirements: SecurityRequirementObject[]): boolean {
    if (!requirements || !Object.keys(requirements).length) {
      return true;
    }
    // one needs to be fulfilled
    for (const req of requirements) {
      const reqNames = Object.keys(req);
      if (reqNames.every(rn => this.hasRequirement(rn, req[rn]))) {
        return true;
      }
    }
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
}

function getSecurityInformation(spec: OpenAPIObject) {
  const securitySchemes: SecuritySchemeItem[] = [];
  const definitions = spec.securityDefinitions || (spec.components && spec.components.securitySchemes) || {};
  for (const [schemeName, schemeDef] of Object.entries(definitions)) {
    securitySchemes.push({
      name: schemeName,
      securityScheme: schemeDef as SecuritySchemeObject,
      authenticated: false,
      credentials: null
    });
  }

  return securitySchemes;
}
