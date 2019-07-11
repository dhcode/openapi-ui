import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenAPIObject } from 'openapi3-ts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  url = 'https://petstore.swagger.io/v2/swagger.json';

  spec: OpenAPIObject;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSpec();
  }

  loadSpec() {
    this.spec = null;
    this.http.get<OpenAPIObject>(this.url).subscribe(s => {
      this.spec = s;
    });
  }
}
