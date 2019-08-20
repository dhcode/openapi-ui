import { NgModule } from '@angular/core';
import { OpenapiViewerComponent } from './openapi-viewer.component';
import { CommonModule } from '@angular/common';
import { OperationComponent } from './operation/operation.component';
import { ParameterComponent } from './parameter/parameter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResponsesComponent } from './responses/responses.component';
import { MultiItemsInputComponent } from './parameter/multi-items-input/multi-items-input.component';
import { RequestsListComponent } from './requests-list/requests-list.component';
import { RequestViewComponent } from './requests-list/request-view/request-view.component';
import { OpenableDirective } from './directives/openable.directive';
import { HttpClientModule } from '@angular/common/http';
import { MethodHeaderComponent } from './shared-components/method-header/method-header.component';
import { MethodComponent } from './shared-components/method/method.component';
import { IndexNavComponent } from './index-nav/index-nav.component';
import { OperationViewComponent } from './operation-view/operation-view.component';
import { OpenapiViewerRoutingModule } from './openapi-viewer-routing.module';
import { OverviewViewComponent } from './overview-view/overview-view.component';
import { TabNavComponent } from './shared-components/tab-nav/tab-nav.component';
import { TabNavItemDirective } from './shared-components/tab-nav/tab-nav-item.directive';
import { TemplateOutletComponent } from './shared-components/template-outlet/template-outlet.component';
import { MarkdownModule } from 'ngx-markdown';
import { RequestBodyInputComponent } from './request-body-input/request-body-input.component';
import { AuthenticationViewComponent } from './authentication-view/authentication-view.component';
import { AuthCredentialsComponent } from './authentication-view/auth-credentials/auth-credentials.component';

@NgModule({
  declarations: [
    OpenapiViewerComponent,
    OperationComponent,
    ParameterComponent,
    ResponsesComponent,
    MultiItemsInputComponent,
    RequestsListComponent,
    RequestViewComponent,
    OpenableDirective,
    MethodHeaderComponent,
    MethodComponent,
    IndexNavComponent,
    OperationViewComponent,
    OverviewViewComponent,
    TabNavComponent,
    TabNavItemDirective,
    TemplateOutletComponent,
    RequestBodyInputComponent,
    AuthenticationViewComponent,
    AuthCredentialsComponent
  ],
  imports: [CommonModule, OpenapiViewerRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule, MarkdownModule.forRoot()],
  exports: [OpenapiViewerComponent, OperationComponent]
})
export class OpenapiViewerModule {}
