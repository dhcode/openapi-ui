import { Injectable } from '@angular/core';
import { OpenAPIObject, PathItemObject, TagObject } from 'openapi3-ts';
import { OperationObject, ParameterObject } from 'openapi3-ts/src/model/OpenApi';
import Swagger from 'swagger-client';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { TagIndex, OavRequest, OperationsItem, PathItem, SwaggerRequest } from './openapi-viewer.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { httpMethods } from './openapi-viewer.constants';
import { map } from 'rxjs/operators';

@Injectable()
export class OpenapiViewerService {
  spec = new BehaviorSubject<OpenAPIObject>(null);
  tagIndex = new BehaviorSubject<TagIndex[]>([]);
  loadErrors = new BehaviorSubject([]);

  requests: OavRequest[] = [];

  constructor(private http: HttpClient) {}

  async loadSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
    if (this.loadErrors.value.length) {
      this.loadErrors.next([]);
    }
    if (this.tagIndex.value.length) {
      this.tagIndex.next([]);
    }
    const resolveResult = await Swagger.resolve({ spec });
    console.log('loaded spec', resolveResult);
    this.spec.next(resolveResult.spec);
    this.tagIndex.next(getTagIndex(resolveResult.spec));
    if (resolveResult.errors && resolveResult.errors.length) {
      this.loadErrors.next(resolveResult.errors);
    }
    return resolveResult.spec;
  }

  createRequest(
    operationId: string,
    parameters: Record<string, any>,
    requestContentType: string,
    responseContentType: string
  ): SwaggerRequest {
    // See https://github.com/swagger-api/swagger-js/blob/master/src/execute/index.js#L91
    const params = {
      spec: this.spec.value,
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
        responseType: 'blob',
        reportProgress: true
      })
    );

    reqInfo.requester = new Observable(subscriber => {
      reqInfo.running = true;
      return req$.subscribe(
        status => {
          if (status.type === HttpEventType.ResponseHeader || status.type === HttpEventType.Response) {
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
    this.spec.next(null);
    this.tagIndex.next([]);
  }

  getTags(): Observable<TagObject[]> {
    return this.spec.pipe(map(spec => spec.tags));
  }
}

function getTagIndex(spec: OpenAPIObject): TagIndex[] {
  return spec.tags.map(tag => ({
    tag,
    paths: getPathsByTag(spec, tag.name)
  }));
}

function getPathsByTag(spec: OpenAPIObject, tag: string): PathItem[] {
  const paths = Object.keys(spec.paths);
  const result: PathItem[] = [];
  for (const path of paths) {
    const pathObject: PathItemObject = spec.paths[path];

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

function getOperationsOfPath(pathObject: PathItemObject, parentParameters?: ParameterObject[]): OperationsItem[] {
  const ops: OperationsItem[] = [];
  for (const method of httpMethods) {
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
  for (const method of httpMethods) {
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
