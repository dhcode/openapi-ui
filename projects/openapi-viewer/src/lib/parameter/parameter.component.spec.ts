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

  it('should build arrayWithSelection', () => {
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

  it('should build text', () => {
    const spec: ParameterObject = {
      description: '',
      in: 'query',
      name: 'name',
      required: true,
      type: 'string'
    };

    component.formGroup = new FormGroup({});
    component.mediaType = 'application/json';
    component.parameter = spec;
    fixture.detectChanges();
    expect(component.displayMode).toBe('text');
    expect(component.formGroup.get('name')).toBeDefined();
    expect(component.formGroup.get('name').value).toEqual('');

    const input = element.query(By.css('input'));
    input.nativeElement.value = 'x';
    input.nativeElement.dispatchEvent(new Event('input'));
    expect(component.formGroup.get('name').value).toEqual('x');
  });

  it('should build object input', () => {
    const spec: ParameterObject = {
      description: '',
      in: null,
      inCustom: 'body',
      name: 'body',
      required: true,
      schema: {
        required: ['name'],
        properties: {
          name: {
            type: 'string'
          },
          tag: {
            type: 'string'
          }
        }
      }
    };

    component.formGroup = new FormGroup({});
    component.mediaType = 'application/json';
    component.parameter = spec;
    fixture.detectChanges();
    expect(component.displayMode).toBe('object');
    expect(component.formGroup.get('body')).toBeDefined();
    expect(component.formGroup.get('body').value).toEqual(JSON.stringify({ name: '', tag: '' }, null, 2));

    const input = element.query(By.css('textarea'));
    input.nativeElement.value = '{}';
    input.nativeElement.dispatchEvent(new Event('input'));
    expect(component.formGroup.get('body').value).toEqual('{}');
  });
});
