import { OperationObject, ParameterObject, ServerObject } from 'openapi3-ts/src/model/OpenApi';
import { ResponseObject } from 'openapi3-ts';
import { HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PathItem {
  path: string;
  operations: OperationsItem[];
  summary?: string;
  description?: string;
  servers?: ServerObject[];
  parameters?: ParameterObject[];
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
  status: number;
  error?: string;
  startTs: Date;
  endTs: Date;
  requester: Observable<HttpEvent<any>>;
}

export interface SwaggerRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  body?: FormData | string;
}
