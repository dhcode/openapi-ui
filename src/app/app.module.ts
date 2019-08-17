import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OpenapiViewerModule } from '../../projects/openapi-viewer/src/lib/openapi-viewer.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OavSettings } from '../../projects/openapi-viewer/src/lib/models/openapi-viewer.settings';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, OpenapiViewerModule, HttpClientModule, FormsModule],
  providers: [{ provide: OavSettings, useValue: new OavSettings({ showRawOperationDefinition: true }) }],
  bootstrap: [AppComponent]
})
export class AppModule {}
