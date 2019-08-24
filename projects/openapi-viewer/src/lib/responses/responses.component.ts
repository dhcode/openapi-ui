import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { exampleFromSchema } from '../util/data-generator.util';
import { ResponseItem } from '../models/openapi-viewer.model';
import { HeaderObject } from 'openapi3-ts';
import { JSONSchema6Definition } from 'json-schema';

@Component({
  selector: 'oav-responses',
  templateUrl: './responses.component.html'
})
export class ResponsesComponent implements OnChanges {
  @Input() responses: ResponseItem[];

  @Input() responseType: string;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.responses) {
      return;
    }
    for (const res of this.responses) {
      if (res.schema) {
        res.example = JSON.stringify(exampleFromSchema(res.schema), null, 2);
      }
      if (res.headers) {
        res.exampleHeaders = Object.keys(res.headers).map(headerName => ({
          name: headerName,
          example: getHeaderExampleValue(res.headers[headerName])
        }));
      }
    }
  }
}

function getHeaderExampleValue(headerObject: HeaderObject) {
  if (headerObject.schema) {
    return exampleFromSchema(headerObject.schema as JSONSchema6Definition);
  } else if (headerObject.type) {
    return exampleFromSchema((headerObject as unknown) as JSONSchema6Definition);
  }
  return '';
}
