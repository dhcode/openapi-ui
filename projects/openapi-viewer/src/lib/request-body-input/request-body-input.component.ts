import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MediaTypeObject, ParameterObject, RequestBodyObject, SchemaObject } from 'openapi3-ts';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'oav-request-body-input',
  templateUrl: './request-body-input.component.html',
  styles: []
})
export class RequestBodyInputComponent implements OnInit, OnDestroy, OnChanges {
  @Input() requestBody: RequestBodyObject;
  @Input() addToFormGroup: FormGroup;
  formGroup = new FormGroup({
    contentType: new FormControl()
  });

  contentParameters: Record<string, Partial<ParameterObject>[]> = {};

  contentTypes: string[] = [];

  currentContentType: string;

  currentParameters: Partial<ParameterObject>[] = [];

  constructor() {}

  ngOnInit() {
    this.addToFormGroup.addControl('requestBody', this.formGroup);
  }

  ngOnDestroy(): void {
    this.addToFormGroup.removeControl('requestBody');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.identifyParameters();
  }

  private identifyParameters() {
    this.contentParameters = {};
    this.contentTypes = [];
    if (!this.requestBody || !this.requestBody.content) {
      return;
    }

    this.contentTypes = Object.keys(this.requestBody.content);
    if (this.contentTypes.length) {
      for (const type of this.contentTypes) {
        this.contentParameters[type] = this.contentToParameter(type, this.requestBody.content[type]);
      }

      this.currentContentType = this.contentTypes[0];
      this.currentParameters = this.contentParameters[this.currentContentType];
      this.formGroup.patchValue({ contentType: this.currentContentType });
    }
  }

  private contentToParameter(mediaType: string, def: MediaTypeObject): Partial<ParameterObject>[] {
    if ((mediaType === 'application/x-www-form-urlencoded' || mediaType.startsWith('multipart')) && def.schema) {
      const schema = def.schema as SchemaObject;
      if ((schema.type === 'object' || !schema.type) && schema.properties) {
        return Object.keys(schema.properties).map(key => {
          const propScheme = schema.properties[key] as SchemaObject;
          return {
            name: key,
            customIn: 'form-data',
            required: schema.required && schema.required.includes(key),
            description: propScheme.description,
            schema: propScheme
          };
        });
      }
    }
    const param: Partial<ParameterObject> = {
      name: 'requestBody',
      customIn: 'body',
      required: this.requestBody.required,
      description: this.requestBody.description,
      schema: def.schema,
      example: def.example,
      examples: def.examples
    };

    return [param];
  }
}
