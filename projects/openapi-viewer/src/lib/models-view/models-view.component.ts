import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { OpenapiViewerService } from '../services/openapi-viewer.service';
import { Subscription } from 'rxjs';
import {
  CallbackObject,
  ExampleObject,
  HeaderObject,
  LinkObject,
  OpenAPIObject,
  ParameterObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  SecuritySchemeObject
} from 'openapi3-ts';
import { OavSettings } from '../models/openapi-viewer.settings';

interface DefinitionCategory {
  name: string;
  label: string;
  definitions: DefinitionItem[];
}

interface DefinitionItem {
  name: string;
  schema?: SchemaObject;
  response?: ResponseObject;
  parameter?: ParameterObject;
  example?: ExampleObject;
  requestBody?: RequestBodyObject;
  header?: HeaderObject;
  securityScheme?: SecuritySchemeObject;
  link?: LinkObject;
  callback?: CallbackObject;
}

const categoryLabels = {
  schema: 'Schemas',
  response: 'Responses',
  parameter: 'Parameters',
  example: 'Examples',
  requestBody: 'RequestBodies',
  header: 'Headers',
  securityScheme: 'SecuritySchemes',
  link: 'Links',
  callback: 'Callbacks'
};

@Component({
  selector: 'oav-models-view',
  templateUrl: './models-view.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelsViewComponent implements OnInit, OnDestroy {
  categories: DefinitionCategory[] = [];

  private sub: Subscription;

  constructor(private openApiService: OpenapiViewerService, @Optional() private oavSettings: OavSettings, private cd: ChangeDetectorRef) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
  }

  get showRaw(): boolean {
    return this.oavSettings.showRawModelDefinition;
  }

  ngOnInit() {
    this.sub = this.openApiService.spec.subscribe(spec => {
      this.categories = identifyModels(spec);
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

function getCategory(propName, categories: DefinitionCategory[]) {
  const existing = categories.find(c => c.name === propName);
  if (existing) {
    return existing;
  }
  const cat: DefinitionCategory = {
    name: propName,
    label: categoryLabels[propName],
    definitions: []
  };
  categories.push(cat);
  return cat;
}

function addToCategory(defItem: DefinitionItem, categories: DefinitionCategory[]) {
  const categoryPropsNames = Object.keys(categoryLabels);
  for (const propName of categoryPropsNames) {
    if (defItem[propName]) {
      const cat = getCategory(propName, categories);
      cat.definitions.push(defItem);
    }
  }
}

function identifyModels(spec: OpenAPIObject): DefinitionCategory[] {
  const categories: DefinitionCategory[] = [];
  if (spec.definitions) {
    // OASv2
    Object.keys(spec.definitions)
      .map(name => getDefinitionItemV2(name, spec.definitions[name]))
      .forEach(defItem => addToCategory(defItem, categories));
  }
  if (spec.components) {
    // OASv3
    Object.keys(spec.components).forEach(categoryPlural => {
      const category = categoryPlural.substr(0, categoryPlural.length - 1);
      const cat = getCategory(category, categories);
      Object.keys(spec.components[categoryPlural])
        .map(name => getDefinitionsItemV3(category, name, spec.components[categoryPlural][name]))
        .forEach(defItem => {
          cat.definitions.push(defItem);
        });
    });
    return;
  }
  return categories;
}

function getDefinitionsItemV3(category: string, name: string, component: any): DefinitionItem {
  const item: DefinitionItem = { name };
  item[category] = component;
  return item;
}

function getDefinitionItemV2(name: string, def: any): DefinitionItem {
  const item: DefinitionItem = { name };
  if (def.in) {
    item.parameter = def;
  } else if (def.type) {
    item.schema = def;
  } else if (def.description) {
    item.response = def;
  }
  return item;
}
