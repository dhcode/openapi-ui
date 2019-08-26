import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AceConfigInterface } from 'ngx-ace-wrapper';
import 'brace';
import 'brace/mode/json';
import 'brace/mode/xml';
import { ValidateFunction } from 'ajv';
import { getValidationFunction } from '../../util/validation.util';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'oav-code-input',
  templateUrl: './code-input.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeInputComponent),
      multi: true
    }
  ]
})
export class CodeInputComponent implements OnChanges, ControlValueAccessor, OnInit, OnDestroy {
  config: AceConfigInterface = {};

  disabled = false;

  value = '';

  @Input() readonly: boolean | string;

  @Input() mode: 'json' | 'xml' | 'text' = 'text';

  @Input() minLines = 1;
  @Input() maxLines = 20;

  @Input() schema = null;

  errors: string[] = [];
  private writing = false;
  private validate: ValidateFunction = null;
  private changes = new Subject();

  private onChange = (v: string) => {};
  private onTouched = () => {};

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.changes.pipe(debounceTime(100)).subscribe(() => this.checkValue());
  }

  ngOnDestroy(): void {
    this.changes.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.schema) {
      try {
        this.validate = getValidationFunction(this.schema);
      } catch (e) {
        console.error('Failed to get validation function for schema', this.schema, e);
        this.validate = null;
        this.errors = [e.message];
      }
    } else {
      this.validate = null;
      this.errors = [];
    }
    this.updateConfig();
  }

  updateConfig() {
    this.config = {
      minLines: this.minLines,
      maxLines: this.maxLines,
      wrap: true,
      tabSize: 2
    };
    if (this.readonly || this.readonly === '') {
      this.config.readOnly = true;
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
  }

  writeValue(obj: string): void {
    this.value = obj;
    this.writing = true;
    try {
      this.cd.detectChanges();
    } catch (e) {
      console.error('Update Ace error', this.value, e);
    }

    this.writing = false;
    this.changes.next();
  }

  updateValue(value: string) {
    if (!this.writing) {
      this.value = value;
      this.changes.next();
      this.onChange(value);
    }
  }

  checkValue() {
    if (this.validate && this.mode === 'json') {
      this.errors = [];
      if (!this.value) {
        return;
      }
      try {
        const text = JSON.parse(this.value);
        if (!this.validate(text)) {
          this.errors = this.validate.errors.map(e => `${e.dataPath}: ${e.keyword} ${e.message}`);
          console.log(this.validate.errors);
        }
      } catch (e) {
        this.errors = [e.message];
      }
    }
  }
}
