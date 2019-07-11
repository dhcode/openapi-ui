import { Component, Input, OnInit } from '@angular/core';
import { OavRequest, OpenapiViewerService, OperationsItem, PathItem } from '../openapi-viewer.service';
import { FormGroup } from '@angular/forms';
import { OperationObject } from 'openapi3-ts';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'oav-operation',
  templateUrl: './operation.component.html'
})
export class OperationComponent implements OnInit {
  @Input() tag: string;
  @Input() pathItem: PathItem;
  @Input() operationItem: OperationsItem;

  open = false;

  responseType: string;

  formGroup: FormGroup;

  requests: OavRequest[] = [];

  constructor(private openApiService: OpenapiViewerService, private router: Router, private route: ActivatedRoute) {}

  get operation(): OperationObject {
    return this.operationItem.operation;
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.length) {
        const parts = fragment.split('/');
        if (parts[0] === this.tag && parts[1] === this.operation.operationId) {
          console.log('open fragment', parts.slice(1));
          this.open = true;
        }
      }
    });

    this.formGroup = new FormGroup({}, { updateOn: 'blur' });

    this.responseType = this.operationItem.responseTypes[0] || 'application/json';

    // this.formGroup.valueChanges.subscribe(value => {
    //   console.log('valueChanges', value);
    // });
  }

  send() {
    try {
      const req = this.openApiService.createRequest(this.operationItem.operation.operationId, this.formGroup.value, '', this.responseType);
      const reqInfo = this.openApiService.runRequest(this.pathItem, this.operationItem, req);
      console.log('request', req);
      this.requests.push(reqInfo);
    } catch (e) {
      console.warn('Create request error', e);
    }
  }

  toggleOpen() {
    if (this.open) {
      this.router.navigate([], { fragment: this.tag });
      this.open = false;
    } else {
      this.router.navigate([], { fragment: this.getFragment() });
    }
  }

  getFragment() {
    return this.tag + '/' + this.operation.operationId;
  }
}
