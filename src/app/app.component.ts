import { Component, OnInit } from '@angular/core';
import { OpenAPIObject } from 'openapi3-ts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  url = 'https://petstore.swagger.io/v2/swagger.json';
  // url = 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/uspto.yaml';

  specUrl: string;

  spec: OpenAPIObject;

  error = null;

  constructor() {}

  ngOnInit(): void {
    this.loadSpec();
  }

  loadSpec() {
    this.specUrl = this.url;
  }
}
