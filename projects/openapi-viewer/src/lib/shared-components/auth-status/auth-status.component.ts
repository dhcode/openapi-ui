import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { OperationObject } from 'openapi3-ts';
import { OavSettings } from '../../models/openapi-viewer.settings';
import { OpenapiAuthService } from '../../services/openapi-auth.service';
import { AuthStatus, SecurityRequirementStatus } from '../../models/openapi-viewer.model';
import { CdkPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'oav-auth-status',
  templateUrl: './auth-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthStatusComponent implements OnChanges, OnInit, OnDestroy {
  @Input() operation: OperationObject;

  @ViewChild(CdkPortal, { static: true }) portal: CdkPortal;
  @ViewChild('statusIcon', { static: false }) statusIcon: ElementRef;

  authStatus: AuthStatus;

  showAuthentication: boolean;

  requiredSchemes: SecurityRequirementStatus[][];

  schemeNames = [];

  private sub: Subscription;

  constructor(@Optional() private oavSettings: OavSettings, private authService: OpenapiAuthService, private cd: ChangeDetectorRef) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
    this.showAuthentication = this.oavSettings.enableAuthentication;
  }

  ngOnInit(): void {
    this.sub = this.authService.updatedCredentials.subscribe(schemeName => {
      if (this.schemeNames.includes(schemeName)) {
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.operation) {
      this.authStatus = this.authService.getAuthStatus(this.operation.security);
      this.requiredSchemes = this.authService.getRequiredSchemes(this.operation.security);
      this.schemeNames = [];
      for (const reqs of this.requiredSchemes) {
        for (const scheme of reqs) {
          this.schemeNames.push(scheme.name);
        }
      }
    }
  }
}
