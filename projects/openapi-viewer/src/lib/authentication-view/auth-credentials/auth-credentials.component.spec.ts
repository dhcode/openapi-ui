import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCredentialsComponent } from './auth-credentials.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenapiAuthService } from '../../services/openapi-auth.service';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
