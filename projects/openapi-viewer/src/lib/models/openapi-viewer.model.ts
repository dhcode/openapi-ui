import { ResponseObject, TagObject, ServerObject, OperationObject, ParameterObject, SecuritySchemeObject } from 'openapi3-ts';
import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'trace';

export type AuthStatus = 'none' | 'required' | 'ok';

export interface PathItem {
  path: string;
  operations: OperationsItem[];
  summary?: string;
  description?: string;
  servers?: ServerObject[];
  parameters?: ParameterObject[];
}

export interface TagIndex {
  tag: TagObject;
  paths: PathItem[];
}

export interface OperationsItem {
  method: string;
  operation: OperationObject;
  parameters: ParameterObject[];
  responses: ResponseItem[];
  responseTypes: string[];
}

export interface BasicAuthCredentials {
  username: string;
  password: string;
}
export interface OAuthToken {
  access_token: string;
  token_type: string;
}
export interface OAuthCredentials {
  token: OAuthToken;
  scopes: string[];
}
export type SecurityCredentials = BasicAuthCredentials | OAuthCredentials | string;

export interface SecuritySchemeItem {
  name: string;
  securityScheme: SecuritySchemeObject;
  authenticated: boolean;
  remember: boolean;
  credentials: SecurityCredentials;
}

export interface SecurityRequirementStatus {
  name: string;
  securityScheme: SecuritySchemeObject;
  authenticated: boolean;
  scopes?: string[];
}

export interface ResponseItem extends ResponseObject {
  status: number;
}

export interface OavRequest {
  id: string;
  pathItem: PathItem;
  operationsItem: OperationsItem;
  request: SwaggerRequest;
  running: boolean;
  canceled: boolean;
  sentBytes: number;
  receivedBytes: number;
  status: number;
  statusText: string;
  error?: string;
  startTs: Date;
  endTs: Date;
  httpEvents: Observable<HttpEvent<any>>;
  cancel: () => void;
}

export interface SwaggerRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  body?: FormData | string;
}
