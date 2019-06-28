import { Component, Input, OnInit } from '@angular/core';
import { OpenapiViewerService, OperationsItem, PathItem } from '../openapi-viewer.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'oav-operation',
  templateUrl: './operation.component.html'
})
export class OperationComponent implements OnInit {

  @Input() tag: string;
  @Input() pathItem: PathItem;
  @Input() operationItem: OperationsItem;

  responseType: string;

  formGroup: FormGroup;

  constructor(private openApiService: OpenapiViewerService) {
  }

  ngOnInit() {
    this.formGroup = new FormGroup({}, {updateOn: 'blur'});

    this.responseType = this.operationItem.responseTypes[0] || 'application/json';

    this.formGroup.valueChanges.subscribe(value => {
      console.log('valueChanges', value);
    });
  }

  send() {


    try {
      const req = this.openApiService.createRequest(this.operationItem.operation.operationId, this.formGroup.value, '', this.responseType);
      this.openApiService.runRequest(this.pathItem, this.operationItem, req);
      console.log('request', req);
    } catch (e) {
      console.warn('Create request error', e);
    }

  }

}
