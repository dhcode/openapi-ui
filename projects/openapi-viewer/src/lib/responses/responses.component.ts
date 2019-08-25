import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { exampleFromSchema, getJsonString, getStarMatcher } from '../util/data-generator.util';
import { ResponseItem } from '../models/openapi-viewer.model';
import { ExampleObject, HeaderObject, ResponseObject, ResponsesObject } from 'openapi3-ts';
import { JSONSchema6Definition } from 'json-schema';
import { HeadersObject, MediaTypeObject } from 'openapi3-ts/src/model/OpenApi';
import { getDisplayMode, getExampleValue } from '../util/parameter-input.util';

interface ResponseContentItem {
  name?: string;
  summary?: string;
  description?: string;
  value?: string;
  externalValueUrl?: string;
}
interface ResponseHeaderExample {
  name: string;
  description?: string;
  deprecated?: boolean;
  value: string;
}
interface ResponseCodeItem {
  statusCode: string;
  description: string;
  headers?: ResponseHeaderExample[];
  contents?: ResponseContentItem[];
  // TODO add links support, see: https://swagger.io/specification/#responseObject
}

@Component({
  selector: 'oav-responses',
  templateUrl: './responses.component.html'
})
export class ResponsesComponent implements OnChanges {
  @Input() responses: ResponsesObject;

  @Input() responseType: string;

  items: ResponseCodeItem[] = [];

  mode = 'text';

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.responses) {
      return;
    }
    if (this.responseType && this.responseType.startsWith('application/json')) {
      this.mode = 'json';
    } else if (this.responseType && this.responseType.startsWith('application/xml')) {
      this.mode = 'xml';
    } else {
      this.mode = 'text';
    }
    this.items = getExamplesByContentType(this.responses, this.responseType);
  }
}

function getExamplesByContentType(responses: ResponsesObject, contentType: string): ResponseCodeItem[] {
  return Object.keys(responses).map(statusCode => {
    const res: ResponseObject = responses[statusCode];

    return {
      statusCode,
      description: res.description,
      headers: getExampleHeaders(res.headers),
      contents: getExampleContents(res, contentType)
    };
  });
}

function getExampleContents(res: ResponseObject, contentType: string): ResponseContentItem[] {
  if (res.schema) {
    return [
      {
        value: JSON.stringify(exampleFromSchema(res.schema), null, 2)
      }
    ];
  }
  if (!res.content) {
    return [];
  }
  let content: MediaTypeObject = res.content[contentType];
  if (!content) {
    const mediaType = Object.keys(res.content).find(mt => getStarMatcher(mt).test(contentType));
    if (mediaType) {
      content = res.content[mediaType];
    }
  }
  if (!content) {
    return [];
  }
  if (content.example && contentType.includes('json')) {
    return [{ value: getJsonString(content.example) }];
  }
  if (content.examples) {
    return Object.keys(content.examples).map(exName => {
      const example: ExampleObject = content.examples[exName];
      return {
        name: exName,
        summary: example.summary,
        description: example.description,
        value: getJsonString(example.value),
        externalValueUrl: example.externalValue
      };
    });
  }
  if (content.schema) {
    return [
      {
        value: JSON.stringify(exampleFromSchema(content.schema as JSONSchema6Definition), null, 2)
      }
    ];
  }
  return [];
}

function getExampleHeaders(headers: HeadersObject): ResponseHeaderExample[] {
  if (!headers) {
    return [];
  }
  return Object.keys(headers).map(headerName => {
    const header: HeaderObject = headers[headerName];
    return {
      name: headerName,
      description: header.description,
      deprecated: header.deprecated,
      value: getHeaderExampleValue(header)
    };
  });
}

function getHeaderExampleValue(headerObject: HeaderObject) {
  const displayMode = getDisplayMode(headerObject);
  return getExampleValue(displayMode, headerObject, null);
}
