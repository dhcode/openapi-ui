import { Component, Input, OnInit } from '@angular/core';
import { ResponseItem } from '../openapi-viewer.service';

@Component({
  selector: 'oav-responses',
  templateUrl: './responses.component.html'
})
export class ResponsesComponent implements OnInit {

  @Input() responses: ResponseItem[];

  @Input() responseType: string;

  constructor() { }

  ngOnInit() {
  }

}
