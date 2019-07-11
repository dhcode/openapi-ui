import { Injectable } from '@angular/core';
import { OpenAPIObject, PathItemObject, TagObject } from 'openapi3-ts';
import { OperationObject, ParameterObject } from 'openapi3-ts/src/model/OpenApi';
import Swagger from 'swagger-client';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { OavRequest, OperationsItem, PathItem, SwaggerRequest } from './openapi-viewer.model';
import { Observable } from 'rxjs';

const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'trace'];

@Injectable()
export class OpenapiViewerService {
  spec: OpenAPIObject = null;
  loadErrors = [];

  requests: OavRequest[] = [];

  constructor(private http: HttpClient) {}

  async loadSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
    const resolveResult = await Swagger.resolve({ spec });
    console.log('loaded spec', resolveResult);
    this.spec = resolveResult.spec;
    this.loadErrors = resolveResult.errors;
    return this.spec;
  }

  createRequest(
    operationId: string,
    parameters: Record<string, any>,
    requestContentType: string,
    responseContentType: string
  ): SwaggerRequest {
    // See https://github.com/swagger-api/swagger-js/blob/master/src/execute/index.js#L91
    const params = {
      spec: this.spec,
      operationId,
      parameters,
      securities: undefined,
      requestContentType,
      responseContentType,
      scheme: undefined,
      requestInterceptor: undefined,
      responseInterceptor: undefined,
      contextUrl: undefined,
      userFetch: undefined,
      requestBody: undefined,
      server: undefined,
      serverVariables: undefined,
      http: undefined
    };

    return Swagger.buildRequest(params);
  }

  runRequest(pathItem: PathItem, operationsItem: OperationsItem, request: SwaggerRequest): OavRequest {
    const reqInfo: OavRequest = {
      id: Math.floor(0x100000000 + Math.random() * 0x100000000).toString(16),
      pathItem,
      operationsItem,
      request,
      running: true,
      startTs: new Date(),
      endTs: null,
      requester: null,
      status: 0
    };

    this.requests.push(reqInfo);
    const headers = new HttpHeaders(request.headers);

    const req$ = this.http.request(
      new HttpRequest(request.method, request.url, request.body, {
        headers,
        responseType: 'text',
        reportProgress: true
      })
    );

    reqInfo.requester = new Observable(subscriber => {
      reqInfo.running = true;
      return req$.subscribe(
        status => {
          if (status.type === HttpEventType.ResponseHeader) {
            reqInfo.status = status.status;
          }
          if (status.type === HttpEventType.Response) {
            reqInfo.endTs = new Date();
            reqInfo.running = false;
          }
          subscriber.next(status);
        },
        err => {
          reqInfo.endTs = new Date();
          reqInfo.running = false;
          subscriber.error(err);
        },
        () => {
          subscriber.complete();
        }
      );
    });

    return reqInfo;
  }

  resetSpec() {
    this.spec = null;
  }

  getTags(): TagObject[] {
    return this.spec.tags;
  }

  getPathsByTag(tag: string): PathItem[] {
    const paths = Object.keys(this.spec.paths);
    const result: PathItem[] = [];
    for (const path of paths) {
      const pathObject: PathItemObject = this.spec.paths[path];

      const tags = getTagsOfPath(pathObject);
      if (tag.length && tags.includes(tag)) {
        const pathItem = {
          path,
          summary: pathObject.summary,
          description: pathObject.description,
          parameters: pathObject.parameters as ParameterObject[],
          servers: pathObject.servers,
          operations: null
        };
        pathItem.operations = getOperationsOfPath(pathObject, pathItem.parameters);
        result.push(pathItem);
      }
    }
    return result;
  }
}

function getOperationsOfPath(pathObject: PathItemObject, parentParameters?: ParameterObject[]): OperationsItem[] {
  const ops: OperationsItem[] = [];
  for (const method of methods) {
    const operation: OperationObject = pathObject[method];
    if (operation) {
      const parameters = [];
      const responses = [];
      if (parentParameters) {
        parameters.push(...parentParameters);
      }
      if (operation.parameters) {
        parameters.push(...operation.parameters);
      }
      if (operation.responses) {
        responses.push(...Object.entries(operation.responses).map(([status, value]) => ({ status, ...value })));
      }
      ops.push({
        method,
        operation,
        parameters,
        responses,
        responseTypes: identifyResponseTypes(operation)
      });
    }
  }
  return ops;
}

export function getTagsOfPath(pathObject: PathItemObject): string[] {
  const tags = [];
  for (const method of methods) {
    const operation: OperationObject = pathObject[method];
    if (operation && operation.tags) {
      tags.push(...operation.tags);
    }
  }
  return tags;
}

function identifyResponseTypes(operation: OperationObject): string[] {
  if (operation.produces) {
    return operation.produces;
  }
  const types = new Set();
  for (const [status, res] of Object.entries(operation.responses)) {
    for (const contentType of Object.keys(res.content)) {
      types.add(contentType);
    }
  }
  return [...types];
}
