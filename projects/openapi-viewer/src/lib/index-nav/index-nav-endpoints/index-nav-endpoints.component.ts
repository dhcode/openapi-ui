import { ChangeDetectionStrategy, Component, Input, Optional } from '@angular/core';
import { OavSettings } from '../../models/openapi-viewer.settings';
import { OperationsItem, PathItem, TagIndex } from '../../models/openapi-viewer.model';

@Component({
  selector: 'oav-index-nav-endpoints',
  templateUrl: './index-nav-endpoints.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexNavEndpointsComponent {
  @Input() tag: TagIndex;

  showHoverLabel: boolean;

  constructor(@Optional() private oavSettings: OavSettings) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
    this.showHoverLabel = !!this.oavSettings.indexHoverLabel;
  }

  getPrimaryLabel(op: OperationsItem, pathItem: PathItem): string {
    return getLabel(op, pathItem, this.oavSettings.indexPrimaryLabel);
  }

  getHoverLabel(op: OperationsItem, pathItem: PathItem): string {
    return getLabel(op, pathItem, this.oavSettings.indexHoverLabel);
  }
}

function getLabel(op: OperationsItem, pathItem: PathItem, fields: string[]): string {
  for (const field of fields) {
    if (field === 'path') {
      return pathItem.path;
    }
    if (op.operation[field]) {
      return op.operation[field];
    }
  }
  return '';
}
