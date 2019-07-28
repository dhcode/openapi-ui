import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodComponent } from './method.component';
import { By } from '@angular/platform-browser';

describe('MethodComponent', () => {
  let component: MethodComponent;
  let fixture: ComponentFixture<MethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MethodComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MethodComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display method', () => {
    component.method = 'get';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('span')).nativeElement.className).toBe('oav-method oav-method-get');
    expect(fixture.debugElement.query(By.css('span')).nativeElement.textContent).toBe('GET');
  });
});
