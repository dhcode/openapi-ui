import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  BasicAuthCredentials,
  FlowInfo,
  OAuthCredentials,
  OAuthFlow,
  OAuthToken,
  ScopesInfo,
  SecuritySchemeItem
} from '../../models/openapi-viewer.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { identifyFlows, OpenapiAuthService } from '../../services/openapi-auth.service';
import { Subscription } from 'rxjs';
import { randomHex } from '../../util/data-generator.util';

@Component({
  selector: 'oav-auth-credentials',
  templateUrl: './auth-credentials.component.html',
  styles: []
})
export class AuthCredentialsComponent implements OnInit, OnChanges, OnDestroy {
  displayMode: 'unknown' | 'apiKey' | 'usernamePassword' | 'oauth' = 'unknown';

  username = new FormControl('');
  password = new FormControl('');
  apiKey = new FormControl('');
  clientId = new FormControl('');
  clientSecret = new FormControl('');
  scopes = new FormArray([]);
  flow = new FormControl('');
  remember = new FormControl(false);

  scopesInfo: ScopesInfo[] = [];

  loading = false;
  error = null;

  token: OAuthToken;

  /**
   * The available flows
   */
  flows: FlowInfo[] = [];
  currentFlow: FlowInfo;

  formGroup: FormGroup;

  @Input() securityScheme: SecuritySchemeItem;

  private sub: Subscription;

  constructor(private authService: OpenapiAuthService) {}

  ngOnInit() {
    this.sub = this.flow.valueChanges.subscribe(flow => {
      this.readOAuthCredentials(flow);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.securityScheme && this.securityScheme) {
      this.checkScheme();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkScheme() {
    const type: string = this.securityScheme.securityScheme.type;
    if (type === 'apiKey') {
      this.displayMode = 'apiKey';
      this.readApiKey();
    } else if (type === 'http' || type === 'basic') {
      this.displayMode = 'usernamePassword';
      this.readHttpCredentials();
    } else if (type === 'oauth2' || type === 'openIdConnect') {
      this.displayMode = 'oauth';
      this.readOAuthCredentials();
    } else {
      this.displayMode = 'unknown';
    }
    if (this.securityScheme.remember) {
      this.remember.patchValue(true);
    }
  }

  readApiKey() {
    this.formGroup = new FormGroup({ apiKey: this.apiKey, remember: this.remember });
    if (typeof this.securityScheme.credentials === 'string') {
      this.apiKey.patchValue(this.securityScheme.credentials);
    } else {
      this.apiKey.patchValue('');
    }
  }

  readHttpCredentials() {
    this.formGroup = new FormGroup({ username: this.username, password: this.password, remember: this.remember });
    const credentials = this.securityScheme.credentials as BasicAuthCredentials;
    if (typeof credentials === 'object' && credentials) {
      if (typeof credentials.username === 'string') {
        this.username.patchValue(credentials.username);
      } else {
        this.username.patchValue('');
      }
      if (typeof credentials.password === 'string') {
        this.password.patchValue(credentials.password);
      } else {
        this.password.patchValue('');
      }
    } else {
      this.username.patchValue('');
      this.password.patchValue('');
    }
  }

  readOAuthCredentials(flow?: OAuthFlow) {
    const credentials = this.securityScheme.credentials as OAuthCredentials;
    if (!flow && credentials && credentials.flow) {
      flow = credentials.flow;
    }

    this.token = credentials.token;

    this.flows = identifyFlows(this.securityScheme.securityScheme);
    const currentFlow: FlowInfo = flow ? this.flows.find(f => f.flow === flow) : this.flows[0];
    if (!currentFlow) {
      return;
    }
    this.currentFlow = currentFlow;
    this.scopesInfo = currentFlow.scopes;

    this.formGroup = new FormGroup({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      username: this.username,
      password: this.password,
      scopes: this.scopes,
      remember: this.remember
    });
    this.scopes.clear();
    this.remember.patchValue(true);
    this.flow.patchValue(currentFlow.flow);

    if (typeof credentials === 'object' && credentials) {
      this.clientId.patchValue(credentials.clientId);
      this.clientSecret.patchValue(credentials.clientSecret);
      this.username.patchValue(credentials.username || '');
      this.password.patchValue(credentials.password || '');
      for (const scope of this.scopesInfo) {
        this.scopes.push(new FormControl(credentials.scopes.includes(scope.scope)));
      }
    } else {
      this.clientId.patchValue('');
      for (const scope of this.scopesInfo) {
        this.scopes.push(new FormControl(true));
      }
    }
  }

  save() {
    if (this.displayMode === 'apiKey') {
      this.authService.updateCredentials(this.securityScheme.name, this.apiKey.value, this.apiKey.value.length > 0, this.remember.value);
    }
    if (this.displayMode === 'usernamePassword') {
      this.authService.updateCredentials(
        this.securityScheme.name,
        {
          username: this.username.value,
          password: this.password.value
        },
        this.username.value.length > 0,
        this.remember.value
      );
    }
    if (this.displayMode === 'oauth') {
      const scopes = this.scopesInfo.map((s, i) => (this.scopes.value[i] ? s.scope : null)).filter(s => !!s);
      const credentials: OAuthCredentials = {
        clientId: this.clientId.value,
        clientSecret: this.clientSecret.value,
        username: this.username.value,
        password: this.password.value,
        flow: this.flow.value,
        scopes,
        token: null,
        nonce: randomHex(16),
        redirectUri: getCurrentUrl()
      };
      this.loading = true;
      this.error = null;
      this.authService.runOAuthAuthorization(this.securityScheme.name, credentials).subscribe(
        () => {
          this.loading = false;
        },
        err => {
          this.loading = false;
          this.error = err;
        }
      );
    }
    this.formGroup.markAsPristine();
  }

  removeToken() {
    this.authService.removeToken(this.securityScheme.name);
  }
}

function getCurrentUrl(): string {
  const url = window.location.href;
  const idx = url.indexOf('?');
  if (idx !== -1) {
    return url.slice(0, idx);
  }
  return url;
}
