import { NgModule } from '@angular/core';
import { OpenapiViewerComponent } from './openapi-viewer.component';
import { CommonModule } from '@angular/common';
import { OperationComponent } from './operation/operation.component';
import { ParameterComponent } from './parameter/parameter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResponsesComponent } from './responses/responses.component';
import { MultiItemsInputComponent } from './shared-components/multi-items-input/multi-items-input.component';
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
import { AuthStatusComponent } from './shared-components/auth-status/auth-status.component';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { TooltipComponent } from './shared-components/tooltip/tooltip.component';
import { TooltipDirective } from './shared-components/tooltip/tooltip.directive';
import { CodeInputComponent } from './shared-components/code-input/code-input.component';
import { IndexNavEndpointsComponent } from './index-nav/index-nav-endpoints/index-nav-endpoints.component';
import { OverviewViewEndpointsComponent } from './overview-view/overview-view-endpoints/overview-view-endpoints.component';
import { ModelsViewComponent } from './models-view/models-view.component';
import { JsonSchemaComponent } from './shared-components/json-schema/json-schema.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

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
    AuthCredentialsComponent,
    AuthStatusComponent,
    TooltipComponent,
    TooltipDirective,
    CodeInputComponent,
    IndexNavEndpointsComponent,
    OverviewViewEndpointsComponent,
    ModelsViewComponent,
    JsonSchemaComponent
  ],
  imports: [
    CommonModule,
    OpenapiViewerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    PortalModule,
    OverlayModule,
    CodemirrorModule
  ],
  exports: [OpenapiViewerComponent, OperationComponent]
})
export class OpenapiViewerModule {}
