import { Injectable } from '@angular/core';
import { OpenAPIObject, PathItemObject, ResponseObject, TagObject } from 'openapi3-ts';
import { OperationObject, ParameterObject, ServerObject } from 'openapi3-ts/src/model/OpenApi';
import { pointer } from 'jsonref';
import Swagger from 'swagger-client';

const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'trace'];

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
  request: any;
  running: boolean;
  error?: string;
  startTs: Date;
  endTs: Date;
  response: Response;
}

@Injectable()
export class OpenapiViewerService {

  spec: OpenAPIObject = null;
  loadErrors = [];

  requests: OavRequest[] = [];

  constructor() {
  }

  // async loadSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
  //   console.log('load spec', spec);
  //   this.spec = await parse(spec, {
  //     scope: 'https://localhost/swagger.json',
  //     retriever
  //   });
  //   console.log('loaded spec', this.spec);
  //   return this.spec;
  //
  //   function retriever(url) {
  //     const opts = {
  //       method: 'GET'
  //     };
  //     return fetch(url, opts).then((response) => {
  //       return response.json();
  //     });
  //   }
  // }

  async loadSpec(spec: OpenAPIObject): Promise<OpenAPIObject> {
    const resolveResult = await Swagger.resolve({spec});
    console.log('loaded spec', resolveResult);
    this.spec = resolveResult.spec;
    this.loadErrors = resolveResult.errors;
    return this.spec;
  }

  createRequest(operationId: string, parameters: Record<string, any>, requestContentType: string, responseContentType: string) {
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

  runRequest(pathItem: PathItem, operationsItem: OperationsItem, request: any): OavRequest {
    const reqInfo: OavRequest = {
      id: Math.floor(0x100000000 + Math.random() * 0x100000000).toString(16),
      pathItem,
      operationsItem,
      request,
      running: true,
      startTs: new Date(),
      endTs: null,
      response: null
    };

    this.requests.push(reqInfo);

    fetch(request.url, request).then(res => {
      reqInfo.response = res;
      reqInfo.endTs = new Date();
      reqInfo.running = false;
      console.log('reqInfo', reqInfo);
    }, err => {
      console.log('request error', err);
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
      let pathObject: PathItemObject = this.spec.paths[path];
      if ('$ref' in pathObject) {
        pathObject = pointer(this.spec, pathObject.$ref);
      }

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
        pathItem.operations = this.getOperationsOfPath(pathObject, pathItem.parameters);
        result.push(pathItem);
      }
    }
    return result;
  }

  getOperationsOfPath(pathObject: PathItemObject, parentParameters?: ParameterObject[]): OperationsItem[] {
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
          responses.push(...Object.entries(operation.responses).map(([status, value]) => ({status, ...value})));
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
