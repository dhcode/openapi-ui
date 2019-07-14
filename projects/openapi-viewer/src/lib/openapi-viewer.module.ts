import { NgModule } from '@angular/core';
import { OpenapiViewerComponent } from './openapi-viewer.component';
import { GroupComponent } from './group/group.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OperationComponent } from './operation/operation.component';
import { ParameterComponent } from './parameter/parameter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResponsesComponent } from './responses/responses.component';
import { MultiItemsInputComponent } from './parameter/multi-items-input/multi-items-input.component';
import { RequestsListComponent } from './requests-list/requests-list.component';
import { RequestViewComponent } from './requests-list/request-view/request-view.component';
import { OpenableDirective } from './directives/openable.directive';
import { HttpClientModule } from '@angular/common/http';
import { MethodHeaderComponent } from './method-header/method-header.component';

@NgModule({
  declarations: [
    OpenapiViewerComponent,
    GroupComponent,
    OperationComponent,
    ParameterComponent,
    ResponsesComponent,
    MultiItemsInputComponent,
    RequestsListComponent,
    RequestViewComponent,
    OpenableDirective,
    MethodHeaderComponent
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  exports: [OpenapiViewerComponent]
})
export class OpenapiViewerModule {}
