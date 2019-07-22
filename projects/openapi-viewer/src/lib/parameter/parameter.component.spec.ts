import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParameterComponent } from './parameter.component';
import { MultiItemsInputComponent } from './multi-items-input/multi-items-input.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ParameterObject } from 'openapi3-ts';

describe('ParameterComponent', () => {
  let fixture: ComponentFixture<ParameterComponent>;
  let component: ParameterComponent;
  let element: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ParameterComponent, MultiItemsInputComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ParameterComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement;
  }));

  it('should create the component', () => {
    expect(component).toBeDefined();
  });

  it('should create the parameter component', () => {
    const spec: ParameterObject = {
      collectionFormat: 'multi',
      description: 'Status values that need to be considered for filter',
      in: 'query',
      items: {
        default: 'available',
        enum: ['available', 'pending', 'sold'],
        type: 'string'
      },
      name: 'status',
      required: true,
      type: 'array'
    };

    component.formGroup = new FormGroup({});
    component.mediaType = 'application/json';
    component.parameter = spec;
    fixture.detectChanges();
    expect(component.displayMode).toBe('arrayWithSelection');
    expect(component.formGroup.get('status')).toBeDefined();
    expect(component.formGroup.get('status').value).toEqual(['available']);

    const select = element.query(By.css('select'));
    const options = select.queryAll(By.css('option'));
    expect(options.map(el => el.nativeElement.textContent)).toEqual(component.parameter.items.enum);

    options[1].nativeElement.selected = true;
    select.nativeElement.dispatchEvent(new Event('change'));
    expect(component.formGroup.get('status').value).toEqual(['available', 'pending']);
  });
});
