import { HttpMethod } from './models/openapi-viewer.model';
import { SecuritySchemeType } from 'openapi3-ts';

export const httpMethods: HttpMethod[] = ['get', 'put', 'post', 'delete', 'options', 'head', 'trace'];

export const securitySchemeTypes: SecuritySchemeType[] = ['apiKey', 'http', 'oauth2', 'openIdConnect'];

export const securitySchemeTypesWithScopes: SecuritySchemeType[] = ['oauth2', 'openIdConnect'];
