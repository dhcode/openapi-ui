import { Directive, ElementRef, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, TemplatePortal } from '@angular/cdk/portal';

@Directive({
  selector: '[oavTooltip]'
})
export class TooltipDirective {
  @Input() oavTooltip: CdkPortal;

  private overlayRef: OverlayRef;

  constructor(private overlay: Overlay, private elementRef: ElementRef, private viewContainer: ViewContainerRef) {}

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    e.stopPropagation();
    this.open();
  }

  @HostListener('window:click')
  onWindowClick() {
    this.close();
  }

  open() {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          {
            overlayX: 'start',
            overlayY: 'top',
            originX: 'start',
            originY: 'bottom'
          }
        ])
    });
    this.overlayRef.attach(this.oavTooltip);
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
