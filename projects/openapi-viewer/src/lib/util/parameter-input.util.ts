import { ExampleObject, ParameterObject, ReferenceObject, SchemaObject } from 'openapi3-ts';
import { exampleFromSchema } from './data-generator.util';
import { JSONSchema6Definition } from 'json-schema';

interface DisplayMode {
  mode: string;
  checkV2: (param: ParameterObject) => boolean;
  checkV3: (param: ParameterObject) => boolean;
  getDefault: (param: ParameterObject, mediaType: string) => any;
}

const primitiveTypes = ['string', 'integer', 'number', 'boolean'];

const displayModes = [
  {
    mode: 'text',
    checkV2: (param: ParameterObject) => param.type === 'string',
    checkV3: (param: ParameterObject) => schemaType(param) === 'string',
    getDefault: (param: ParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'integer',
    checkV2: (param: ParameterObject) => param.type === 'integer',
    checkV3: (param: ParameterObject) => schemaType(param) === 'integer',
    getDefault: (param: ParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'object',
    checkV2: (param: ParameterObject) => param.type === 'object',
    checkV3: (param: ParameterObject) => schemaType(param) === 'object',
    getDefault: (param: ParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'arrayWithSelection',
    checkV2: (param: ParameterObject) => param.type === 'array' && param.items && param.items.enum,
    checkV3: (param: ParameterObject) => schemaType(param) === 'array' && (param.schema as SchemaObject).enum,
    getDefault: (param: ParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'arrayWithPrimitive',
    checkV2: (param: ParameterObject) => param.type === 'array' && primitiveTypes.includes(itemsType(param)),
    checkV3: (param: ParameterObject) => schemaType(param) === 'array' && primitiveTypes.includes(itemsType(param.schema)),
    getDefault: (param: ParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'array',
    checkV2: (param: ParameterObject) => param.type === 'array',
    checkV3: (param: ParameterObject) => schemaType(param) === 'array',
    getDefault: (param: ParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'file',
    checkV2: (param: ParameterObject) => param.type === 'file',
    checkV3: (param: ParameterObject) => false,
    getDefault: (param: ParameterObject, mediaType: string) => ''
  },
  {
    mode: 'any',
    checkV2: (param: ParameterObject) => true,
    checkV3: (param: ParameterObject) => true,
    getDefault: (param: ParameterObject, mediaType: string) => ''
  }
];

function schemaType(param: ParameterObject): string {
  const schema = param && 'schema' in param ? (param.schema as SchemaObject) : null;
  return schema && schema.type;
}

function itemsType(obj: { items?: any } | any) {
  if (obj && Array.isArray(obj.items)) {
    return obj.items[0].type;
  } else if (obj && obj.items) {
    return obj.items.type;
  }
  console.log('items type not found', obj);
}

function getExample(param: ParameterObject, mediaType: string): any {
  if ('example' in param) {
    return param.example;
  }
  if ('examples' in param && param.examples[mediaType] && 'value' in param.examples[mediaType]) {
    return (param.examples[mediaType] as ExampleObject).value;
  }
  if (param.schema) {
    return exampleFromSchema(param.schema as JSONSchema6Definition);
  }
  if (param.type === 'array' && param.items && 'default' in param.items) {
    return [param.items.default];
  }
  return exampleFromSchema(param as any);
}

export function getDisplayMode(param: ParameterObject): string {
  for (const dm of displayModes) {
    if ('type' in param && dm.checkV2(param)) {
      return dm.mode;
    } else if (dm.checkV3(param)) {
      return dm.mode;
    }
  }
  return 'any';
}

export function getExampleValue(displayMode: string, param: ParameterObject, mediaType: string) {
  return displayModes.find(dm => dm.mode === displayMode).getDefault(param, mediaType);
}
