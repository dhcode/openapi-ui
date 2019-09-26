import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { OpenapiViewerElementModule } from './app/openapi-viewer-element.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(OpenapiViewerElementModule)
  .catch(err => console.error(err));
