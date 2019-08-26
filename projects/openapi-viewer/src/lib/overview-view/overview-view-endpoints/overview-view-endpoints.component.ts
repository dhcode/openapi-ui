import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TagIndex } from '../../models/openapi-viewer.model';

@Component({
  selector: 'oav-overview-view-endpoints',
  templateUrl: './overview-view-endpoints.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewViewEndpointsComponent {
  @Input() tag: TagIndex;

  constructor() {}
}
