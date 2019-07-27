import { OpenableDirective } from './openable.directive';
import { Component, DebugElement, ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div oavOpenable #openable="openable">content</div>
  `
})
class TestComponent {}

describe('OpenableDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let element: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenableDirective, TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    element = fixture.debugElement;
  });

  it('should create an instance', () => {
    const div = element.query(By.directive(OpenableDirective));
    const directive = div.injector.get(OpenableDirective);
    expect(directive.open).toBeFalsy();
    expect(div.classes.openable).toBeTruthy();
    expect(div.classes.open).toBeUndefined();
    div.nativeElement.click();
    expect(directive.open).toBeTruthy();
    expect(div.classes.open).toBeTruthy();
  });
});
