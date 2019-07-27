import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { OpenapiViewerService } from '../openapi-viewer.service';
import { FormGroup } from '@angular/forms';
import { OperationObject } from 'openapi3-ts';
import { ActivatedRoute, Router } from '@angular/router';
import { OavRequest, OperationsItem, PathItem } from '../openapi-viewer.model';

@Component({
  selector: 'oav-operation',
  templateUrl: './operation.component.html'
})
export class OperationComponent implements OnChanges {
  @Input() tag: string;
  @Input() pathItem: PathItem;
  @Input() operationItem: OperationsItem;

  responseType: string;

  formGroup: FormGroup;

  requests: OavRequest[] = [];

  openRequest = null;

  constructor(private openApiService: OpenapiViewerService, private router: Router, private route: ActivatedRoute) {}

  get operation(): OperationObject {
    return this.operationItem.operation;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.operationItem && this.operationItem) {
      this.requests = this.openApiService.getRequestsByOperationId(this.operationItem.operation.operationId).reverse();
      this.formGroup = new FormGroup({}, { updateOn: 'blur' });
      this.responseType = this.operationItem.responseTypes[0] || 'application/json';
    }
  }

  send() {
    try {
      const req = this.openApiService.createRequest(this.operationItem.operation.operationId, this.formGroup.value, '', this.responseType);
      const reqInfo = this.openApiService.runRequest(this.pathItem, this.operationItem, req);
      console.log('request', req);
      this.requests.unshift(reqInfo);
      this.openRequest = reqInfo;
    } catch (e) {
      console.warn('Create request error', e);
    }
  }
}
