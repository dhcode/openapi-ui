import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationViewComponent } from './operation-view.component';

describe('OperationViewComponent', () => {
  let component: OperationViewComponent;
  let fixture: ComponentFixture<OperationViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OperationViewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
