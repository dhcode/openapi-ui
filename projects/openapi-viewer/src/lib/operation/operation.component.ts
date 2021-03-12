import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, Optional, SimpleChanges } from '@angular/core';
import { OpenapiViewerService } from '../services/openapi-viewer.service';
import { FormControl, FormGroup } from '@angular/forms';
import { OperationObject } from 'openapi3-ts';
import { AuthStatus, OavRequest, OperationsItem, PathItem } from '../models/openapi-viewer.model';
import { defaultOavSettings, OavSettings } from '../models/openapi-viewer.settings';
import { OpenapiAuthService } from '../services/openapi-auth.service';

@Component({
  selector: 'oav-operation',
  templateUrl: './operation.component.html'
})
export class OperationComponent implements OnChanges, OnDestroy {
  @Input() tag: string;
  @Input() pathItem: PathItem;
  @Input() operationItem: OperationsItem;

  responseType = new FormControl('application/json');

  formGroup: FormGroup;

  requests: OavRequest[] = [];

  openRequest = null;

  showRawOperationDefinition = false;

  showAuthentication = true;

  authStatus: AuthStatus;

  constructor(
    private openApiService: OpenapiViewerService,
    @Optional() private oavSettings: OavSettings,
    private authService: OpenapiAuthService,
    private cd: ChangeDetectorRef
  ) {
    if (!this.oavSettings) {
      this.oavSettings = defaultOavSettings;
    }
    this.showRawOperationDefinition = this.oavSettings.showRawOperationDefinition;
    this.showAuthentication = this.oavSettings.enableAuthentication;
  }

  get operation(): OperationObject {
    return this.operationItem.operation;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.operationItem && this.operationItem) {
      if (changes.operationItem.previousValue && this.formGroup) {
        const prevOperation: OperationsItem = changes.operationItem.previousValue;
        this.openApiService.saveOperationParameters(prevOperation.operation.operationId, this.formGroup.value);
      }

      this.requests = this.openApiService.getRequestsByOperationId(this.operationItem.operation.operationId).reverse();
      this.formGroup = new FormGroup({ __responseType: this.responseType });
      this.responseType.patchValue(this.operationItem.responseTypes[0] || 'application/json');
      this.authStatus = this.authService.getAuthStatus(this.operationItem.operation.security);
      const savedParams = this.openApiService.loadOperationParameters(this.operation.operationId);
      if (savedParams) {
        this.cd.detectChanges();
        this.formGroup.patchValue(savedParams);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.operationItem) {
      this.openApiService.saveOperationParameters(this.operation.operationId, this.formGroup.value);
    }
  }

  send() {
    try {
      const parameters = { ...this.formGroup.value };
      let requestBody;
      let contentType = '';
      if (parameters.requestBody) {
        contentType = parameters.requestBody.contentType;
        requestBody = parameters.requestBody.requestBody;
        delete parameters.requestBody;
      }
      const req = this.openApiService.createRequest(
        this.operationItem.operation.operationId,
        parameters,
        requestBody,
        contentType,
        this.responseType.value
      );
      const reqInfo = this.openApiService.runRequest(this.pathItem, this.operationItem, req);
      this.requests.unshift(reqInfo);
      this.openRequest = reqInfo;
    } catch (e) {
      console.warn('Create request error', e);
    }
  }
}
