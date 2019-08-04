import { Component, Input, OnInit } from '@angular/core';
import { exampleFromSchema } from '../util/data-generator.util';
import { ResponseItem } from '../openapi-viewer.model';
import { HeaderObject } from 'openapi3-ts';
import { JSONSchema6Definition } from 'json-schema';

@Component({
  selector: 'oav-responses',
  templateUrl: './responses.component.html'
})
export class ResponsesComponent implements OnInit {
  @Input() responses: ResponseItem[];

  @Input() responseType: string;

  constructor() {}

  ngOnInit() {
    for (const res of this.responses) {
      if (res.schema) {
        res.example = JSON.stringify(exampleFromSchema(res.schema), null, 2);
      }
      if (res.headers) {
        res.exampleHeaders = Object.keys(res.headers).map(headerName => ({
          name: headerName,
          example: JSON.stringify(exampleFromSchema((res.headers[headerName] as HeaderObject).schema as JSONSchema6Definition), null, 2)
        }));
      }
    }
  }
}
