import { Component, OnInit } from '@angular/core';
import { OpenAPIObject } from 'openapi3-ts';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  urlOptions = [
    { url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/uspto.yaml', label: 'USPTO v3' },
    {
      url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/api-with-examples.yaml',
      label: 'API examples v3'
    },
    {
      url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore-expanded.yaml',
      label: 'Petstore v3'
    },
    { url: 'https://petstore.swagger.io/v2/swagger.json', label: 'Petstore v2' }
  ];

  url = 'https://petstore.swagger.io/v2/swagger.json';
  // url = 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/uspto.yaml';

  specUrl: string;

  spec: OpenAPIObject;

  error = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.url) {
        this.url = queryParams.url;
      }
      this.loadSpec();
    });
  }

  updateUrl(url) {
    this.url = url;
  }

  loadSpec() {
    this.specUrl = this.url;
  }
}
