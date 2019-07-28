import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'oav-template-outlet',
  templateUrl: './template-outlet.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateOutletComponent {
  @Input() tpl: TemplateRef<any> | string;
  @Input() ctx: any;

  isTemplate(): boolean {
    return this.tpl instanceof TemplateRef;
  }
}
