import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCredentialsComponent } from './auth-credentials.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenapiAuthService } from '../../services/openapi-auth.service';
import { SecuritySchemeItem } from '../../models/openapi-viewer.model';
import { SimpleChange } from '@angular/core';
import { SecuritySchemeType } from 'openapi3-ts';

describe('AuthCredentialsComponent', () => {
  let component: AuthCredentialsComponent;
  let fixture: ComponentFixture<AuthCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AuthCredentialsComponent],
      providers: [OpenapiAuthService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should support api key', () => {
    const secScheme: SecuritySchemeItem = {
      name: 'apiKey',
      authenticated: false,
      credentials: null,
      remember: false,
      securityScheme: { type: 'apiKey', name: 'api_key', in: 'header' }
    };
    const authService: OpenapiAuthService = TestBed.get(OpenapiAuthService);
    authService.securitySchemes.next([secScheme]);

    component.securityScheme = secScheme;
    component.ngOnChanges({ securityScheme: new SimpleChange(undefined, secScheme, true) });

    expect(component.displayMode).toBe('apiKey');
    expect(component.formGroup.get('apiKey')).toBe(component.apiKey);
    expect(component.formGroup.get('remember')).toBe(component.remember);
    expect(component.apiKey.value).toBe('');

    component.apiKey.setValue('testKey');

    component.save();

    expect(secScheme.authenticated).toBe(true);
    expect(secScheme.credentials).toBe('testKey');
  });

  it('should read api key', () => {
    const secScheme: SecuritySchemeItem = {
      name: 'apiKey',
      authenticated: false,
      credentials: 'secretKey',
      remember: false,
      securityScheme: { type: 'apiKey', name: 'api_key', in: 'header' }
    };
    component.securityScheme = secScheme;
    component.ngOnChanges({ securityScheme: new SimpleChange(undefined, secScheme, true) });

    expect(component.displayMode).toBe('apiKey');
    expect(component.apiKey.value).toBe('secretKey');
  });

  it('should support http basic auth v2', () => {
    const secScheme: SecuritySchemeItem = {
      name: 'auth',
      authenticated: false,
      credentials: null,
      remember: false,
      securityScheme: { type: 'basic' as SecuritySchemeType }
    };

    const authService: OpenapiAuthService = TestBed.get(OpenapiAuthService);
    authService.securitySchemes.next([secScheme]);

    component.securityScheme = secScheme;
    component.ngOnChanges({ securityScheme: new SimpleChange(undefined, secScheme, true) });

    expect(component.displayMode).toBe('usernamePassword');
    expect(component.formGroup.get('username')).toBe(component.username);
    expect(component.formGroup.get('password')).toBe(component.password);
    expect(component.formGroup.get('remember')).toBe(component.remember);
    expect(component.username.value).toBe('');
    expect(component.password.value).toBe('');

    component.username.setValue('testUser');
    component.password.setValue('testPassword');

    component.save();

    expect(secScheme.authenticated).toBe(true);
    expect(secScheme.credentials).toEqual({
      username: 'testUser',
      password: 'testPassword'
    });
  });

  it('should read http basic auth v2', () => {
    const secScheme: SecuritySchemeItem = {
      name: 'auth',
      authenticated: false,
      credentials: { username: 'user', password: '1234' },
      remember: false,
      securityScheme: { type: 'basic' as SecuritySchemeType }
    };
    component.securityScheme = secScheme;
    component.ngOnChanges({ securityScheme: new SimpleChange(undefined, secScheme, true) });

    expect(component.displayMode).toBe('usernamePassword');
    expect(component.username.value).toBe('user');
    expect(component.password.value).toBe('1234');
  });

  it('should support http basic auth v3', () => {
    const secScheme: SecuritySchemeItem = {
      name: 'auth',
      authenticated: false,
      credentials: null,
      remember: false,
      securityScheme: { type: 'http', scheme: 'basic' }
    };

    const authService: OpenapiAuthService = TestBed.get(OpenapiAuthService);
    authService.securitySchemes.next([secScheme]);

    component.securityScheme = secScheme;
    component.ngOnChanges({ securityScheme: new SimpleChange(undefined, secScheme, true) });

    expect(component.displayMode).toBe('usernamePassword');
    expect(component.formGroup.get('username')).toBe(component.username);
    expect(component.formGroup.get('password')).toBe(component.password);
    expect(component.formGroup.get('remember')).toBe(component.remember);
    expect(component.username.value).toBe('');
    expect(component.password.value).toBe('');

    component.username.setValue('testUser');
    component.password.setValue('testPassword');

    component.save();

    expect(secScheme.authenticated).toBe(true);
    expect(secScheme.credentials).toEqual({
      username: 'testUser',
      password: 'testPassword'
    });
  });
});
