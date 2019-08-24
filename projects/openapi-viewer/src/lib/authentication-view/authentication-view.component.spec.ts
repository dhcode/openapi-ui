import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationViewComponent } from './authentication-view.component';
import { AuthCredentialsComponent } from './auth-credentials/auth-credentials.component';
import { OpenapiAuthService } from '../services/openapi-auth.service';
import { MarkdownModule } from 'ngx-markdown';
import { ReactiveFormsModule } from '@angular/forms';

describe('AuthenticationViewComponent', () => {
  let component: AuthenticationViewComponent;
  let fixture: ComponentFixture<AuthenticationViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MarkdownModule.forRoot(), ReactiveFormsModule],
      declarations: [AuthenticationViewComponent, AuthCredentialsComponent],
      providers: [OpenapiAuthService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
