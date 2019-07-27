import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { OavRequest } from '../../openapi-viewer.model';
import { Subject } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

type DisplayMode = 'text' | 'json' | 'download';

@Component({
  selector: 'oav-request-view',
  templateUrl: './request-view.component.html'
})
export class RequestViewComponent implements OnInit, OnDestroy {
  @Input() request: OavRequest;

  @Output() dismiss = new EventEmitter();

  blob: Blob;
  httpHeaders: HttpHeaders;

  body: string;

  headers: string;

  displayLimitBytes = 1024 * 1024;

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
    this.error = null;
    this.headers = '';
    this.body = '';

    this.request.httpEvents.pipe(takeUntil(this.destroy)).subscribe(
      status => {
        console.log('request status', status);
        if (status.type === HttpEventType.ResponseHeader || status.type === HttpEventType.Response) {
          this.setHeaders(status.headers);
        }
        if (status.type === HttpEventType.Response) {
          this.setBody(status);
        }
      },
      err => {
        console.error('error response', err);
        if (err instanceof HttpErrorResponse) {
          this.setErrorBody(err);
        }
        this.error = err.message;
      }
    );
  }

  async setErrorBody(err: HttpErrorResponse) {
    if (err.error instanceof Blob) {
      this.body = await getTextFromBlob(err.error);
    }
  }

  async setBody(response: HttpResponse<any>) {
    this.blob = response.body;
    const contentType = response.headers.get('content-type');
    const textTypes = /^(application\/(json|xml)|text\/)/;
    if (contentType.match(textTypes) && this.displayLimitBytes > this.blob.size) {
      this.displayMode = 'text';
      const body = await getTextFromBlob(response.body);
      if (contentType.startsWith('application/json') && body && body.length) {
        this.displayMode = 'json';
        try {
          const parsed = JSON.parse(body);
          this.body = JSON.stringify(parsed, null, 2);
        } catch (e) {
          this.body = body;
          this.error = e;
        }
      } else {
        this.body = body;
      }
    } else {
      this.displayMode = 'download';
    }
  }

  setHeaders(headers: HttpHeaders) {
    this.httpHeaders = headers;
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
    } else if (this.request.running) {
      return new Date().getTime() - this.request.startTs.getTime();
    } else {
      return null;
    }
  }

  doDismiss() {
    if (this.request.running) {
      this.request.cancel();
    }
    this.dismiss.next();
  }

  download() {
    const contentType = this.httpHeaders.get('content-type');
    const contentDisposition = this.httpHeaders.get('content-disposition');
    const contentType2Ending = {
      'application/json': 'json',
      'application/xml': 'xml',
      'text/plain': 'txt',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/jpeg': 'jpg'
    };
    let name = this.request.operationsItem.operation.operationId;
    const mime = Object.keys(contentType2Ending).find(mimeType => contentType.startsWith(mimeType));
    if (mime) {
      name += '.' + contentType2Ending[mime];
    }
    if (contentDisposition && contentDisposition.match(/filename="?(\w+)"?/)) {
      name = RegExp.$1;
    }

    const link = document.createElement('a');
    const url = URL.createObjectURL(this.blob);
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }
}

function getTextFromBlob(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev: any) => {
      resolve(ev.target.result);
    };
    reader.onerror = err => {
      reject(err);
    };
    reader.readAsText(blob);
  });
}
