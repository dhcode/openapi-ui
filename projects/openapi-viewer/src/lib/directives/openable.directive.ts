import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[oavOpenable]',
  exportAs: 'openable'
})
export class OpenableDirective implements AfterViewInit, OnChanges {
  @Input() oavOpenable = true;

  @Input() open = false;

  constructor(private element: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    if (this.oavOpenable !== false) {
      this.renderer.addClass(this.element.nativeElement, 'openable');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateClass();
  }

  @HostListener('click') onClick() {
    if (this.oavOpenable === false) {
      return;
    }
    this.open = !this.open;
    this.updateClass();
  }

  private updateClass() {
    if (this.open) {
      this.renderer.addClass(this.element.nativeElement, 'open');
    } else {
      this.renderer.removeClass(this.element.nativeElement, 'open');
    }
  }
}
