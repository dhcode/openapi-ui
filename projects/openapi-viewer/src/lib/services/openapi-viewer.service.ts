import { Injectable } from '@angular/core';
import { OpenAPIObject, PathItemObject } from 'openapi3-ts';
import { OperationObject, ParameterObject } from 'openapi3-ts/src/model/OpenApi';
import Swagger from 'swagger-client';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { AuthStatus, OavRequest, OperationsItem, PathItem, SwaggerRequest, TagIndex } from '../models/openapi-viewer.model';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { httpMethods } from '../openapi-viewer.constants';
import { randomHex } from '../util/data-generator.util';
import { OpenapiAuthService } from './openapi-auth.service';

@Injectable()
export class OpenapiViewerService {
  spec = new BehaviorSubject<OpenAPIObject>(null);
  tagIndex = new BehaviorSubject<TagIndex[]>([]);
  loadErrors = new BehaviorSubject([]);

  operationParameterCache: Record<string, any> = {};

  requests: OavRequest[] = [];

  constructor(private http: HttpClient, private authService: OpenapiAuthService) {}

  loadSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
    return this.resolveSpec({ spec });
  }

  loadSpecByUrl(url: string): Promise<OpenAPIObject> {
    return this.resolveSpec({ url });
  }

  private async resolveSpec(swaggerOpts: any): Promise<OpenAPIObject> {
    if (this.loadErrors.value.length) {
      this.loadErrors.next([]);
    }
    if (this.tagIndex.value.length) {
      this.tagIndex.next([]);
    }
    const resolveResult = await Swagger.resolve({ spec: swaggerOpts.spec, url: swaggerOpts.url });
    console.log('loaded spec', resolveResult);
    this.spec.next(resolveResult.spec);
    this.tagIndex.next(getTagIndex(resolveResult.spec));
    this.authService.identifySchemes(resolveResult.spec);
    this.operationParameterCache = {};
    if (resolveResult.errors && resolveResult.errors.length) {
      this.loadErrors.next(resolveResult.errors);
      throw new Error('Spec resolve errors');
    }
    return resolveResult.spec;
  }

  createRequest(
    operationId: string,
    parameters: Record<string, any>,
    requestBody: any,
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
      requestBody,
      server: undefined,
      serverVariables: undefined,
      http: undefined
    };

    return Swagger.buildRequest(params);
  }

  runRequest(pathItem: PathItem, operationsItem: OperationsItem, request: SwaggerRequest): OavRequest {
    const httpEvents = new ReplaySubject<HttpEvent<any>>(1);
    const reqInfo: OavRequest = {
      id: randomHex(8),
      pathItem,
      operationsItem,
      request,
      running: true,
      canceled: false,
      sentBytes: 0,
      receivedBytes: 0,
      startTs: new Date(),
      endTs: null,
      httpEvents,
      statusText: null,
      status: 0,
      cancel: null
    };

    this.requests.push(reqInfo);
    const headers = new HttpHeaders(request.headers);

    const sub = this.http
      .request(
        new HttpRequest(request.method, request.url, request.body, {
          headers,
          responseType: 'blob',
          reportProgress: true
        })
      )
      .subscribe(
        status => {
          if (status.type === HttpEventType.ResponseHeader || status.type === HttpEventType.Response) {
            reqInfo.status = status.status;
            reqInfo.statusText = status.statusText;
          }
          if (status.type === HttpEventType.UploadProgress) {
            reqInfo.sentBytes = status.loaded;
          }
          if (status.type === HttpEventType.DownloadProgress) {
            reqInfo.receivedBytes = status.loaded;
          }
          if (status.type === HttpEventType.Response) {
            reqInfo.endTs = new Date();
            reqInfo.running = false;
          }
          console.log('status', status);
          httpEvents.next(status);
        },
        err => {
          reqInfo.endTs = new Date();
          reqInfo.running = false;
          httpEvents.error(err);
        },
        () => {
          reqInfo.running = false;
          httpEvents.complete();
        }
      );

    reqInfo.cancel = () => {
      sub.unsubscribe();
      reqInfo.canceled = true;
      reqInfo.running = false;
    };

    return reqInfo;
  }

  removeRequest(req: OavRequest) {
    this.requests.splice(this.requests.indexOf(req), 1);
  }

  getRequestsByOperationId(opId: string): OavRequest[] {
    return this.requests.filter(req => req.operationsItem.operation.operationId === opId);
  }

  saveOperationParameters(opId: string, parameters: any) {
    this.operationParameterCache[opId] = parameters;
  }

  loadOperationParameters(opId: string): any {
    return this.operationParameterCache[opId];
  }

  resetSpec() {
    this.spec.next(null);
    this.tagIndex.next([]);
    this.loadErrors.next([]);
  }
}

function getTagIndex(spec: OpenAPIObject): TagIndex[] {
  return (spec.tags || [{ name: 'untagged' }]).map(tag => ({
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
    if ((tag !== 'untagged' && tags.includes(tag)) || (tag === 'untagged' && tags.length === 0)) {
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
      if (!operation.operationId) {
        operation.operationId = 'op-' + randomHex(8);
      }
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
    if (res.content) {
      for (const contentType of Object.keys(res.content)) {
        types.add(contentType);
      }
    }
  }
  return [...types];
}
