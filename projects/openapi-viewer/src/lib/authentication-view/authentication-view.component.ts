import { Component, OnDestroy, OnInit } from '@angular/core';
import { OpenapiAuthService } from '../services/openapi-auth.service';
import { SecuritySchemeItem } from '../models/openapi-viewer.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'oav-authentication-view',
  templateUrl: './authentication-view.component.html',
  styles: []
})
export class AuthenticationViewComponent implements OnInit, OnDestroy {
  schemes: SecuritySchemeItem[] = [];

  private sub: Subscription = null;

  constructor(private authService: OpenapiAuthService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.sub = this.authService.securitySchemes.subscribe(schemas => (this.schemes = schemas));
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.authService.handleOAuthCallback(fragment);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
