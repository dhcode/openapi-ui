import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OavRequest } from '../../openapi-viewer.model';
import { Subject } from 'rxjs';
import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

type DisplayMode = 'text' | 'json' | 'download';

@Component({
  selector: 'oav-request-view',
  templateUrl: './request-view.component.html'
})
export class RequestViewComponent implements OnInit, OnDestroy {
  @Input() request: OavRequest;

  body: string;

  headers: string;

  size = 0;
  total = 0;

  status = null;
  statusText: string = null;

  displayMode: DisplayMode = 'text';

  error: any;

  private destroy = new Subject();

  constructor() {}

  ngOnInit() {
    this.loadResponse();
  }

  ngOnDestroy(): void {
    this.destroy.complete();
  }

  loadResponse() {
    this.size = 0;
    this.total = 0;
    this.status = null;
    this.statusText = null;
    this.error = null;
    this.headers = '';
    this.body = '';

    this.request.requester.pipe(takeUntil(this.destroy)).subscribe(
      status => {
        if (status.type === HttpEventType.DownloadProgress) {
          this.size = status.loaded;
          this.total = status.total;
        }
        if (status.type === HttpEventType.ResponseHeader) {
          this.status = status.status;
          this.statusText = status.statusText;
          this.setHeaders(status.headers);
        }
        if (status.type === HttpEventType.Response) {
          this.setBody(status);
        }
      },
      err => {
        console.error(err);
        this.error = err.message;
      }
    );
  }

  setBody(response: HttpResponse<any>) {
    const contentType = response.headers.get('content-type');
    if (contentType.startsWith('application/json')) {
      this.displayMode = 'json';
      try {
        const parsed = JSON.parse(response.body);
        this.body = JSON.stringify(parsed, null, 2);
      } catch (e) {
        this.body = response.body;
        this.error = e;
      }
    } else {
      this.body = response.body;
    }
  }

  setHeaders(headers: HttpHeaders) {
    const headerLines = [];
    for (const headerName of headers.keys()) {
      for (const value of headers.getAll(headerName)) {
        headerLines.push(headerName + ': ' + value);
      }
    }
    this.headers = headerLines.join('\n');
  }

  getDuration() {
    if (this.request.endTs) {
      return this.request.endTs.getTime() - this.request.startTs.getTime();
    } else {
      return null;
    }
  }
}
