import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';

import { OpenapiViewerElementComponent } from './openapi-viewer-element.component';
import { createCustomElement } from '@angular/elements';
import { OpenapiViewerModule } from '../../../openapi-viewer/src/lib/openapi-viewer.module';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  declarations: [OpenapiViewerElementComponent],
  entryComponents: [OpenapiViewerElementComponent],
  imports: [BrowserModule, OpenapiViewerModule],
  providers: [{ provide: APP_BASE_HREF, useValue: window.location.pathname }]
})
export class OpenapiViewerElementModule implements DoBootstrap {
  constructor(private injector: Injector) {
    const OpenapiViewerElement = createCustomElement(OpenapiViewerElementComponent, { injector: this.injector });
    customElements.define('oav-openapi-viewer-element', OpenapiViewerElement);
  }
  ngDoBootstrap(appRef: ApplicationRef): void {}
}
