import { OperationObject, ParameterObject, ServerObject } from 'openapi3-ts/src/model/OpenApi';
import { ResponseObject, TagObject } from 'openapi3-ts';
import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'trace';

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
