import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BasicAuthCredentials, SecuritySchemeItem } from '../../models/openapi-viewer.model';
import { FormControl, FormGroup } from '@angular/forms';

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

  formGroup;

  @Input() securityScheme: SecuritySchemeItem;

  constructor() {}

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
  }

  readApiKey() {
    this.formGroup = new FormGroup({ apiKey: this.apiKey });
    if (typeof this.securityScheme.credentials === 'string') {
      this.apiKey.patchValue(this.securityScheme.credentials);
    } else {
      this.apiKey.patchValue('');
    }
  }

  readHttpCredentials() {
    this.formGroup = new FormGroup({ username: this.username, password: this.password });
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
      this.securityScheme.credentials = this.apiKey.value;
      this.securityScheme.authenticated = this.apiKey.value.length > 0;
    }
    if (this.displayMode === 'usernamePassword') {
      this.securityScheme.credentials = {
        username: this.username.value,
        password: this.password.value
      };
      this.securityScheme.authenticated = this.username.value.length > 0;
    }
  }
}
