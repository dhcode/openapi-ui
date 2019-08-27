import { JSONSchema6, JSONSchema6Definition } from 'json-schema';

export interface ModelInfo {
  name: string;
  type: string;
  schema: JSONSchema6;
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

export function identifySchemaInfo(defaultName: string, schema: JSONSchema6Definition): SchemaInfo {
  const additionalModels: ModelInfo[] = [];
  const modelInfo = identifyModelInfo(defaultName, readSchema(schema), additionalModels);
  return {
    ...modelInfo,
    additionalModels
  };
}

export function identifyModelInfo(defaultName: string, schema: JSONSchema6, additionalModels: ModelInfo[]): ModelInfo {
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

function readProperties(schema: JSONSchema6, additionalModels: ModelInfo[]): PropertyInfo[] {
  const properties: PropertyInfo[] = [];
  if (schema.properties) {
    properties.push(...readPropertiesOfObject(schema));
  }
  if (schema.additionalProperties) {
    properties.push(readProperty('...', schema.additionalProperties));
  }
  if (Array.isArray(schema.items)) {
    for (let i = 0; i < schema.items.length; i++) {
      properties.push(readProperty(i.toString(), schema.additionalProperties));
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

function updateModelsFromProperty(defaultName: string, schema: JSONSchema6, additionalModels: ModelInfo[]): string {
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
      additionalModels.push(identifyModelInfo(modelName, schema, additionalModels));
    }
    return modelName;
  }
  return null;
}

function readSchema(schema: JSONSchema6Definition): JSONSchema6 {
  if (typeof schema === 'boolean') {
    return { type: 'boolean' };
  }
  return schema;
}

function readType(schema: JSONSchema6Definition): string {
  if (schema && typeof schema === 'object' && schema.type) {
    return Array.isArray(schema.type) ? schema.type[0] : schema.type;
  }
  if (typeof schema === 'boolean') {
    return 'boolean';
  }
  return null;
}

function readModelName(schema: JSONSchema6): string {
  if ((schema as any).$$ref) {
    const refParts = (schema as any).$$ref.split('/');
    return refParts.pop();
  }
  return undefined;
}
function readPropertiesOfObject(schema: JSONSchema6): PropertyInfo[] {
  if (schema.properties) {
    const requiredFields = schema.required || [];
    return Object.keys(schema.properties).map(name => readProperty(name, schema.properties[name], requiredFields.includes(name)));
  }
  return [];
}
function readProperty(name: string, schema: JSONSchema6Definition, required = false): PropertyInfo {
  const s = readSchema(schema);
  const type = Array.isArray(s.type) ? s.type[0] : s.type;
  return { name, type, schema: s, required };
}
