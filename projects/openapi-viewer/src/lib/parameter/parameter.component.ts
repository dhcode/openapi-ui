import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ParameterObject } from 'openapi3-ts';
import { getDisplayMode, getExampleValue } from '../util/parameter-input.util';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'oav-parameter',
  templateUrl: './parameter.component.html'
})
export class ParameterComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;

  @Input() parameter: ParameterObject;

  @Input() mediaType = '';

  displayMode = 'any';

  value: any;

  control: FormControl;

  constructor() {}

  ngOnInit() {
    this.displayMode = getDisplayMode(this.parameter);

    this.value = getExampleValue(this.displayMode, this.parameter, this.mediaType);

    if (this.displayMode === 'object' || this.displayMode === 'array') {
      this.value = JSON.stringify(this.value, null, 2);
    }

    const validators = [];
    if (this.parameter.required) {
      validators.push(Validators.required);
    }

    this.control = new FormControl(this.value, validators);

    if (this.formGroup) {
      this.formGroup.addControl(this.parameter.name, this.control);
    }
  }

  ngOnDestroy(): void {
    if (this.formGroup) {
      this.formGroup.removeControl(this.parameter.name);
    }
  }
}
