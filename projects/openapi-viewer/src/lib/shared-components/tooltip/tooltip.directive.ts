import { Directive, ElementRef, HostListener, Input, OnDestroy, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal } from '@angular/cdk/portal';

@Directive({
  selector: '[oavTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input() oavTooltip: CdkPortal;

  private overlayRef: OverlayRef;

  private fixed = false;

  constructor(private overlay: Overlay, private elementRef: ElementRef, private viewContainer: ViewContainerRef) {}

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    e.stopPropagation();
    this.fixed = true;
    this.open();
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(e: MouseEvent) {
    this.open();
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(e: MouseEvent) {
    if (!this.fixed) {
      this.close();
    }
  }

  @HostListener('window:click')
  onWindowClick() {
    this.close();
  }

  ngOnDestroy(): void {
    this.close();
  }

  open() {
    if (this.overlayRef || !this.oavTooltip) {
      return;
    }
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
    this.fixed = false;
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
