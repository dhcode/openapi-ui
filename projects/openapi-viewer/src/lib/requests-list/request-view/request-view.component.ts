import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { OavRequest } from '../../openapi-viewer.service';

type DisplayMode = 'text' | 'json' | 'download';

@Component({
  selector: 'oav-request-view',
  templateUrl: './request-view.component.html'
})
export class RequestViewComponent implements OnInit, DoCheck {

  @Input() request: OavRequest;

  readBody = false;
  body: string;

  headers: string;

  size = 0;

  displayMode: DisplayMode = 'text';

  error: any;

  constructor() {
  }

  ngOnInit() {
  }

  ngDoCheck(): void {
    if (!this.readBody && this.request.response) {
      this.readBody = true;


      this.loadResponse();
    }
  }

  loadResponse() {
    this.headers = '';
    this.request.response.headers.forEach((value, key) => {
      this.headers += key + ': ' + value + '\n';
    });

    const contentType = this.request.response.headers.get('content-type');
    if (contentType.startsWith('application/json')) {
      this.displayMode = 'json';
      this.request.response.text().then(text => {
        this.size = text.length;
        try {
          const parsed = JSON.parse(text);
          this.body = JSON.stringify(parsed, null, 2);
        } catch (e) {
          this.body = text;
          this.error = e;
        }

      });
    }

    this.request.response.text().then(text => {
      this.body = text;
      this.size = text.length;
    });
  }

  getDuration() {
    if (this.request.endTs) {
      return this.request.endTs.getTime() - this.request.startTs.getTime();
    } else {
      return null;
    }
  }

}
