import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { JSONSchema6Definition } from 'json-schema';
import { identifySchemaInfo, ModelInfo } from '../../util/schema-info.util';

@Component({
  selector: 'oav-json-schema',
  templateUrl: './json-schema.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonSchemaComponent implements OnChanges {
  @Input() schema: JSONSchema6Definition;

  @Input() defaultModelName: string;

  models: ModelInfo[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    const info = identifySchemaInfo(this.defaultModelName, this.schema);
    info.open = true;
    this.models = [info, ...info.additionalModels];
    console.log('models', this.models);
  }

  isPrimitive(type: string): boolean {
    return type === 'integer' || type === 'number' || type === 'string' || type === 'boolean' || type === 'null' || type === 'any';
  }

  toggleModel(model: ModelInfo) {
    if (model.open) {
      model.open = false;
    } else {
      model.open = true;
    }
  }

  toggleModelByName(name) {
    const modelInfo = this.models.find(m => m.name === name);
    if (modelInfo) {
      this.toggleModel(modelInfo);
    }
  }
}
