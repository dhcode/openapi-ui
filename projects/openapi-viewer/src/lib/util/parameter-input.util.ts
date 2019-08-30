import { BaseParameterObject, ExampleObject, SchemaObject } from 'openapi3-ts';
import { exampleFromSchema } from './data-generator.util';

interface DisplayMode {
  mode: string;
  checkV2: (param: BaseParameterObject) => boolean;
  checkV3: (param: BaseParameterObject) => boolean;
  getDefault: (param: BaseParameterObject, mediaType: string) => any;
}

const primitiveTypes = ['string', 'integer', 'number', 'boolean'];

const displayModes = [
  {
    mode: 'textSelect',
    checkV2: (param: BaseParameterObject) => param.type === 'string' && param.items && param.items.enum,
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'string' && (param.schema as SchemaObject).enum,
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'text',
    checkV2: (param: BaseParameterObject) => param.type === 'string',
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'string',
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'integer',
    checkV2: (param: BaseParameterObject) => param.type === 'integer',
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'integer',
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'object',
    checkV2: (param: BaseParameterObject) => param.type === 'object',
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'object' || (param.schema && (param.schema as SchemaObject).properties),
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'arrayWithSelection',
    checkV2: (param: BaseParameterObject) => param.type === 'array' && param.items && param.items.enum,
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'array' && (param.schema as SchemaObject).enum,
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'arrayWithPrimitive',
    checkV2: (param: BaseParameterObject) => param.type === 'array' && primitiveTypes.includes(itemsType(param)),
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'array' && primitiveTypes.includes(itemsType(param.schema)),
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'array',
    checkV2: (param: BaseParameterObject) => param.type === 'array',
    checkV3: (param: BaseParameterObject) => schemaType(param) === 'array',
    getDefault: (param: BaseParameterObject, mediaType: string) => getExample(param, mediaType)
  },
  {
    mode: 'file',
    checkV2: (param: BaseParameterObject) => param.type === 'file',
    checkV3: (param: BaseParameterObject) => false,
    getDefault: (param: BaseParameterObject, mediaType: string) => ''
  },
  {
    mode: 'any',
    checkV2: (param: BaseParameterObject) => true,
    checkV3: (param: BaseParameterObject) => true,
    getDefault: (param: BaseParameterObject, mediaType: string) => ''
  }
];

function schemaType(param: BaseParameterObject): string {
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

function getExample(param: BaseParameterObject, mediaType: string): any {
  if (param.example !== undefined) {
    return param.example;
  }
  if (param.examples !== undefined && param.examples[mediaType] && 'value' in param.examples[mediaType]) {
    return (param.examples[mediaType] as ExampleObject).value;
  }
  if (param.schema) {
    return exampleFromSchema(param.schema);
  }
  if (param.type === 'array' && param.items && 'default' in param.items) {
    return [param.items.default];
  }
  if (isPrimitiveType(param.type) && param.items && 'default' in param.items) {
    return param.items.default;
  }
  return exampleFromSchema(param as any);
}

export function getDisplayMode(param: BaseParameterObject): string {
  for (const dm of displayModes) {
    if ('type' in param && dm.checkV2(param)) {
      return dm.mode;
    } else if (dm.checkV3(param)) {
      return dm.mode;
    }
  }
  return 'any';
}

export function getExampleValue(displayMode: string, param: BaseParameterObject, mediaType: string) {
  return displayModes.find(dm => dm.mode === displayMode).getDefault(param, mediaType);
}

export function isPrimitiveType(type: string) {
  return ['number', 'boolean', 'string', 'integer'].includes(type);
}
