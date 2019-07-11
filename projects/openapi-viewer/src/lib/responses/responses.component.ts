import { Component, Input, OnInit } from '@angular/core';
import { exampleFromSchema } from '../util/data-generator.util';
import { ResponseItem } from '../openapi-viewer.model';

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
    }
  }
}
