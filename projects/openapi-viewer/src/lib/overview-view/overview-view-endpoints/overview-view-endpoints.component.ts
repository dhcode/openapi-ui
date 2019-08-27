import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { OperationsItem, PathItem, TagIndex } from '../../models/openapi-viewer.model';
import { getLabel } from '../../util/visualization.util';
import { OavSettings } from '../../models/openapi-viewer.settings';

@Component({
  selector: 'oav-overview-view-endpoints',
  templateUrl: './overview-view-endpoints.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewViewEndpointsComponent {
  @Input() tag: TagIndex;

  constructor(@Optional() private oavSettings: OavSettings) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
  }

  getLabel(op: OperationsItem, pathItem: PathItem): string {
    return getLabel(op, pathItem, this.oavSettings.overviewPrimaryLabel);
  }
}
