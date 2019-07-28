import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateOutletComponent } from './template-outlet.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <oav-template-outlet [tpl]="tplRef"></oav-template-outlet>
    <ng-template #tplRef>test</ng-template>
  `
})
class TestComponent {}

describe('TemplateOutletComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateOutletComponent, TestComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create template based', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.nativeElement.textContent).toBe('test');
  });
});
