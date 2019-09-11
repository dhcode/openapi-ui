import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'oav-multi-items-input',
  templateUrl: './multi-items-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiItemsInputComponent),
      multi: true
    }
  ]
})
export class MultiItemsInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() name: string;

  @Input() required;

  disabled = false;

  values = new FormArray([]);

  formGroup: FormGroup;

  private subscription;

  constructor() {}

  private onChange = (v: any) => {};

  onTouched = () => {};

  ngOnInit() {
    this.subscription = this.values.valueChanges.subscribe(changedValues => {
      this.onChange(changedValues);
      this.onTouched();
    });

    const controls = {};
    controls[this.name] = this.values;
    this.formGroup = new FormGroup(controls);
  }

  get isRequired(): boolean {
    return typeof this.required !== 'undefined' || this.required === true;
  }

  get controls() {
    return this.values.controls;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.values.disable();
    } else {
      this.values.enable();
    }
  }

  writeValue(obj: string[]): void {
    if (obj) {
      this.values.clear();
      obj.forEach(value => this.values.push(new FormControl({ value, disabled: this.disabled })));
    } else {
      this.values.clear();
    }
  }

  addControl() {
    this.values.push(new FormControl(''));
    this.onTouched();
  }

  removeValue(index: number) {
    this.values.removeAt(index);
    this.onTouched();
  }
}
