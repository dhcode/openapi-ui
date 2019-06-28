import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { OavRequest } from '../../openapi-viewer.service';

@Component({
  selector: 'oav-request-view',
  templateUrl: './request-view.component.html'
})
export class RequestViewComponent implements OnInit, DoCheck {

  @Input() request: OavRequest;

  readBody = false;
  body: string;

  constructor() { }

  ngOnInit() {
  }

  ngDoCheck(): void {
    if (!this.readBody && this.request.response) {
      this.readBody = true;
      this.request.response.text().then(text => {
        this.body = text;
      });
    }
  }

  getDuration() {
    if (this.request.endTs) {
      return this.request.endTs.getTime() - this.request.startTs.getTime();
    } else {
      return null;
    }
  }

}
