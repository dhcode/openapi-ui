import { Component, OnDestroy, OnInit } from '@angular/core';
import { OpenapiAuthService } from '../services/openapi-auth.service';
import { SecuritySchemeItem } from '../models/openapi-viewer.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'oav-authentication-view',
  templateUrl: './authentication-view.component.html',
  styles: []
})
export class AuthenticationViewComponent implements OnInit, OnDestroy {
  schemes: SecuritySchemeItem[] = [];

  private sub: Subscription = null;

  constructor(private authService: OpenapiAuthService) {}

  ngOnInit() {
    this.sub = this.authService.securitySchemes.subscribe(schemas => (this.schemes = schemas));
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
