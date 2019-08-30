import { SchemaObject } from 'openapi3-ts';

export interface ModelInfo {
  name: string;
  type: string;
  schema: SchemaObject;
  properties?: PropertyInfo[] | null;
  open?: boolean;
}

export interface PropertyInfo extends ModelInfo {
  required: boolean;
  modelName?: string;
}

export interface SchemaInfo extends ModelInfo {
  additionalModels: ModelInfo[];
}

export function identifySchemaInfo(defaultName: string, schema: SchemaObject): SchemaInfo {
  const additionalModels: ModelInfo[] = [];
  const modelInfo = identifyModelInfo(defaultName, readSchema(schema), additionalModels);
  return {
    ...modelInfo,
    additionalModels
  };
}

export function identifyModelInfo(defaultName: string, schema: SchemaObject, additionalModels: ModelInfo[]): ModelInfo {
  const info: ModelInfo = {
    name: defaultName,
    type: readType(schema),
    schema: readSchema(schema),
    properties: null
  };
  const modelName = readModelName(info.schema);
  if (modelName) {
    info.name = modelName;
  }
  if (info.type === 'object' || info.type === 'array') {
    info.properties = readProperties(info.schema, additionalModels);
  }
  return info;
}

function readProperties(schema: SchemaObject, additionalModels: ModelInfo[]): PropertyInfo[] {
  const properties: PropertyInfo[] = [];
  if (schema.properties) {
    properties.push(...readPropertiesOfObject(schema));
  }
  if (schema.additionalProperties) {
    properties.push(readProperty('...', schema.additionalProperties as SchemaObject));
  }
  if (Array.isArray(schema.items)) {
    for (let i = 0; i < schema.items.length; i++) {
      properties.push(readProperty(i.toString(), schema.items[i]));
    }
  } else if (schema.items) {
    properties.push(readProperty('', schema.items));
  }
  if (schema.additionalItems) {
    properties.push(readProperty('...', schema.additionalItems));
  }

  for (const prop of properties) {
    const identifiedModel = updateModelsFromProperty(prop.name + 'Object', prop.schema, additionalModels);
    prop.modelName = identifiedModel;
    if (!identifiedModel && (prop.type === 'object' || prop.type === 'array')) {
      prop.properties = readProperties(prop.schema, additionalModels);
    }
  }

  return properties;
}

function updateModelsFromProperty(defaultName: string, schema: SchemaObject, additionalModels: ModelInfo[]): string {
  if (schema.$ref) {
    // Unknown schema, probably did not resolved because of recursive structure
    const parts = schema.$ref.split('/');
    return parts.pop();
  }
  const refName = readModelName(schema);
  if (schema.type === 'object') {
    if (!schema.properties && !schema.additionalProperties) {
      return null;
    }
    const modelName = refName || defaultName;
    if (!additionalModels.find(m => m.name === modelName)) {
      const designatedIndex = additionalModels.length;
      const modelInfo = identifyModelInfo(modelName, schema, additionalModels);
      additionalModels.splice(designatedIndex, 0, modelInfo);
    }
    return modelName;
  }
  return null;
}

function readSchema(schema: SchemaObject): SchemaObject {
  if (typeof schema === 'boolean') {
    return { type: 'boolean' };
  }
  return schema;
}

function readType(schema: SchemaObject): string {
  if (schema && typeof schema === 'object' && schema.type) {
    return Array.isArray(schema.type) ? schema.type[0] : schema.type;
  }
  if (typeof schema === 'boolean') {
    return 'boolean';
  }
  return null;
}

function readModelName(schema: SchemaObject): string {
  if ((schema as any).$$ref) {
    const refParts = (schema as any).$$ref.split('/');
    return refParts.pop();
  }
  return undefined;
}
function readPropertiesOfObject(schema: SchemaObject): PropertyInfo[] {
  if (schema.properties) {
    const requiredFields = schema.required || [];
    return Object.keys(schema.properties).map(name => readProperty(name, schema.properties[name], requiredFields.includes(name)));
  }
  return [];
}
function readProperty(name: string, schema: SchemaObject, required = false): PropertyInfo {
  const s = readSchema(schema);
  const type = Array.isArray(s.type) ? s.type[0] : s.type;
  return { name, type, schema: s, required };
}
