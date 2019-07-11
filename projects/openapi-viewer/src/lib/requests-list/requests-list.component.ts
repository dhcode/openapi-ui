import { Component, Input, OnInit } from '@angular/core';
import { OavRequest, OpenapiViewerService } from '../openapi-viewer.service';

@Component({
  selector: 'oav-requests-list',
  templateUrl: './requests-list.component.html'
})
export class RequestsListComponent implements OnInit {
  openRequests = new Set();

  @Input() requests: OavRequest[] = [];

  constructor(private openApiService: OpenapiViewerService) {}

  ngOnInit() {}

  toggleRequest(req: OavRequest) {
    if (this.openRequests.has(req)) {
      this.openRequests.delete(req);
    } else {
      this.openRequests.add(req);
    }
  }

  getShortUrl(req: OavRequest) {
    if (req.request.url.match(/^.+?\/\/.+?(\/.*)$/)) {
      return RegExp.$1;
    }
    return req.request.url;
  }
}
