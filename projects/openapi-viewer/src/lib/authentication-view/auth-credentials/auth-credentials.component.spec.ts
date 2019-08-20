import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCredentialsComponent } from './auth-credentials.component';

describe('AuthCredentialsComponent', () => {
  let component: AuthCredentialsComponent;
  let fixture: ComponentFixture<AuthCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthCredentialsComponent]
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
