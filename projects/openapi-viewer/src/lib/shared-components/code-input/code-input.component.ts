import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AceConfigInterface } from 'ngx-ace-wrapper';
import 'brace/mode/json';
import 'brace/mode/xml';

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
export class CodeInputComponent implements OnChanges, ControlValueAccessor {
  config: AceConfigInterface = {};

  disabled = false;

  value = '';

  @Input() readonly: boolean | string;

  @Input() mode = 'text';

  @Input() minLines = 1;
  @Input() maxLines = 50;

  private writing = false;
  private onChange = (v: string) => {};
  private onTouched = () => {};

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.updateConfig();
  }

  updateConfig() {
    this.config = {
      minLines: this.minLines,
      maxLines: this.maxLines,
      wrap: true
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
    this.cd.detectChanges();
    this.writing = false;
  }

  updateValue(value: string) {
    if (!this.writing) {
      this.value = value;
      this.onChange(value);
    }
  }
}
