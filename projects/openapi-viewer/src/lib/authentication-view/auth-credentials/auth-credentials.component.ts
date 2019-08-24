import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BasicAuthCredentials, SecuritySchemeItem } from '../../models/openapi-viewer.model';
import { FormControl, FormGroup } from '@angular/forms';
import { OpenapiAuthService } from '../../services/openapi-auth.service';

@Component({
  selector: 'oav-auth-credentials',
  templateUrl: './auth-credentials.component.html',
  styles: []
})
export class AuthCredentialsComponent implements OnInit, OnChanges {
  displayMode: 'unknown' | 'apiKey' | 'usernamePassword' | 'scopes' = 'unknown';

  username = new FormControl('');
  password = new FormControl('');
  apiKey = new FormControl('');
  remember = new FormControl(false);

  formGroup: FormGroup;

  @Input() securityScheme: SecuritySchemeItem;

  constructor(private authService: OpenapiAuthService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.securityScheme) {
      this.checkScheme();
    }
  }

  checkScheme() {
    if (this.securityScheme.securityScheme.type === 'apiKey') {
      this.displayMode = 'apiKey';
      this.readApiKey();
    } else if (this.securityScheme.securityScheme.type === 'http') {
      this.displayMode = 'usernamePassword';
      this.readHttpCredentials();
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
        this.username.patchValue(credentials);
      } else {
        this.username.patchValue('');
      }
      if (typeof credentials.password === 'string') {
        this.password.patchValue(credentials);
      } else {
        this.password.patchValue('');
      }
    } else {
      this.username.patchValue('');
      this.password.patchValue('');
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
    this.formGroup.markAsPristine();
  }
}
