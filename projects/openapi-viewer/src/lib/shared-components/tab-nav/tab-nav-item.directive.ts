import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { randomHex } from '../../util/data-generator.util';

@Directive({
  selector: '[oavTabNavItem]'
})
export class TabNavItemDirective {
  id = randomHex(8);
  label: string | TemplateRef<any>;
  details: any;

  active = false;

  constructor(public templateRef: TemplateRef<any>) {}

  @Input() set oavTabNavItem(label: string | TemplateRef<any>) {
    this.label = label;
  }

  @Input() set oavTabNavItemId(id: string) {
    this.id = id;
  }

  @Input() set oavTabNavItemDetails(details: any) {
    this.details = details;
  }
}
