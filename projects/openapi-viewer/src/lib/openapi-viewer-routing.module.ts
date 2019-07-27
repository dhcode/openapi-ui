import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationViewComponent } from './operation-view/operation-view.component';
import { OverviewViewComponent } from './overview-view/overview-view.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewViewComponent
  },
  {
    path: ':tag/:opId',
    component: OperationViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class OpenapiViewerRoutingModule {}
