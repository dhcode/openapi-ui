import { Component, ElementRef, Input, OnChanges, Optional, SimpleChanges, ViewChild } from '@angular/core';
import { OperationObject } from 'openapi3-ts';
import { OavSettings } from '../../models/openapi-viewer.settings';
import { OpenapiAuthService } from '../../services/openapi-auth.service';
import { AuthStatus, SecurityRequirementStatus } from '../../models/openapi-viewer.model';
import { CdkPortal } from '@angular/cdk/portal';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'oav-auth-status',
  templateUrl: './auth-status.component.html',
  styles: []
})
export class AuthStatusComponent implements OnChanges {
  @Input() operation: OperationObject;

  @ViewChild(CdkPortal, { static: true }) portal: CdkPortal;
  @ViewChild('statusIcon', { static: false }) statusIcon: ElementRef;

  authStatus: AuthStatus;

  showAuthentication: boolean;

  requiredSchemes: SecurityRequirementStatus[][];

  constructor(@Optional() private oavSettings: OavSettings, private authService: OpenapiAuthService, private overlay: Overlay) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
    this.showAuthentication = this.oavSettings.enableAuthentication;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.operation) {
      this.authStatus = this.authService.getAuthStatus(this.operation.security);
      this.requiredSchemes = this.authService.getRequiredSchemes(this.operation.security);
    }
  }
}
