import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestBodyInputComponent } from './request-body-input.component';

describe('RequestBodyInputComponent', () => {
  let component: RequestBodyInputComponent;
  let fixture: ComponentFixture<RequestBodyInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestBodyInputComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestBodyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
