import { Component, OnDestroy, OnInit } from '@angular/core';
import { OpenapiViewerService } from '../services/openapi-viewer.service';
import { combineLatest, Subscription } from 'rxjs';
import { AuthStatus, OperationsItem, TagIndex } from '../models/openapi-viewer.model';
import { OpenAPIObject } from 'openapi3-ts';
import { OpenapiAuthService } from '../services/openapi-auth.service';

@Component({
  selector: 'oav-overview-view',
  templateUrl: './overview-view.component.html',
  styles: []
})
export class OverviewViewComponent implements OnInit, OnDestroy {
  index: TagIndex[] = [];

  spec: OpenAPIObject = null;

  private sub: Subscription;

  constructor(private openApiService: OpenapiViewerService, private authService: OpenapiAuthService) {}

  ngOnInit() {
    this.sub = combineLatest([this.openApiService.spec, this.openApiService.tagIndex]).subscribe(([spec, index]) => {
      this.spec = spec;
      this.index = index;
    });
  }

  getAuthStatus(op: OperationsItem): AuthStatus {
    return this.authService.getAuthStatus(op.operation.security);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
