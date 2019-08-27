import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestBodyInputComponent } from './request-body-input.component';
import { ParameterComponent } from '../parameter/parameter.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiItemsInputComponent } from '../parameter/multi-items-input/multi-items-input.component';
import { MarkdownModule } from 'ngx-markdown';
import { CodeInputComponent } from '../shared-components/code-input/code-input.component';
import { AceModule } from 'ngx-ace-wrapper';
import { JsonSchemaComponent } from '../shared-components/json-schema/json-schema.component';

describe('RequestBodyInputComponent', () => {
  let component: RequestBodyInputComponent;
  let fixture: ComponentFixture<RequestBodyInputComponent>;
  let formGroup: FormGroup;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MarkdownModule, AceModule],
      declarations: [RequestBodyInputComponent, ParameterComponent, MultiItemsInputComponent, CodeInputComponent, JsonSchemaComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    formGroup = new FormGroup({});

    fixture = TestBed.createComponent(RequestBodyInputComponent);
    component = fixture.componentInstance;
    component.addToFormGroup = formGroup;
    component.requestBody = {
      description: 'Pet to add to the store',
      required: true,
      content: {
        'application/json': {
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
        }
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
