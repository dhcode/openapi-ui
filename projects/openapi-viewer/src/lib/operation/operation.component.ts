import { Component, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';
import { OpenapiViewerService } from '../openapi-viewer.service';
import { FormGroup } from '@angular/forms';
import { OperationObject } from 'openapi3-ts';
import { OavRequest, OperationsItem, PathItem } from '../openapi-viewer.model';
import { OavSettings } from '../openapi-viewer.settings';

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

  showRawOperationDefinition = false;

  constructor(private openApiService: OpenapiViewerService, @Optional() private oavSettings: OavSettings) {
    if (this.oavSettings) {
      this.showRawOperationDefinition = this.oavSettings.showRawOperationDefinition;
    }
  }

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
      const parameters = { ...this.formGroup.value };
      let requestBody;
      let contentType = '';
      if (parameters.requestBody) {
        contentType = parameters.requestBody.contentType;
        requestBody = { ...parameters.requestBody };
        delete requestBody.contentType;
        delete parameters.requestBody;
      }
      const req = this.openApiService.createRequest(
        this.operationItem.operation.operationId,
        parameters,
        requestBody,
        contentType,
        this.responseType
      );
      const reqInfo = this.openApiService.runRequest(this.pathItem, this.operationItem, req);
      console.log('request', req);
      this.requests.unshift(reqInfo);
      this.openRequest = reqInfo;
    } catch (e) {
      console.warn('Create request error', e);
    }
  }
}
