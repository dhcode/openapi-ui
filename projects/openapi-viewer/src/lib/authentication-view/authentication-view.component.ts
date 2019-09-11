import { Component, OnDestroy, OnInit } from '@angular/core';
import { OpenapiAuthService } from '../services/openapi-auth.service';
import { SecuritySchemeItem } from '../models/openapi-viewer.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { parseQueryString } from '../util/data-generator.util';

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
      if (fragment && fragment.length) {
        const params = parseQueryString(fragment);
        this.authService.handleOAuthCallback(params);
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params.state) {
        this.authService.handleOAuthCallback(params);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
