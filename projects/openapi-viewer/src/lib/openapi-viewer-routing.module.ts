import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationViewComponent } from './operation-view/operation-view.component';
import { OverviewViewComponent } from './overview-view/overview-view.component';
import { AuthenticationViewComponent } from './authentication-view/authentication-view.component';
import { ModelsViewComponent } from './models-view/models-view.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewViewComponent
  },
  {
    path: 'auth',
    component: AuthenticationViewComponent
  },
  {
    path: 'models',
    component: ModelsViewComponent
  },
  {
    path: ':tag/:opId',
    component: OperationViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class OpenapiViewerRoutingModule {}
