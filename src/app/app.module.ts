import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OavSettings, OpenapiViewerModule } from '@dhcode/openapi-viewer';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, OpenapiViewerModule, HttpClientModule, FormsModule],
  providers: [
    {
      provide: OavSettings,
      useValue: new OavSettings({
        showRawOperationDefinition: true,
        showRawModelDefinition: true
      })
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
