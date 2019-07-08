import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[oavOpenable]',
  exportAs: 'openable'
})
export class OpenableDirective {

  @Input() open = false;

  constructor(private element: ElementRef, private renderer: Renderer2) {
  }

  @HostListener('click') onClick() {
    this.open = !this.open;
    if (this.open) {
      this.renderer.addClass(this.element.nativeElement, 'open');
    } else {
      this.renderer.removeClass(this.element.nativeElement, 'open');
    }
  }

}
