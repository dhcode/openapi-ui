import { JSONSchema6, JSONSchema6Definition } from 'json-schema';

export const formatExampleDate = new Date();
formatExampleDate.setMilliseconds(0);
formatExampleDate.setSeconds(0);

const formatExamples = {
  string: () => '',
  string_email: () => 'user@example.com',
  'string_date-time': () => formatExampleDate.toISOString(),
  string_date: () => formatExampleDate.toISOString().substring(0, 10),
  string_uuid: () => '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  string_hostname: () => 'example.com',
  string_ipv4: () => '198.51.100.42',
  string_ipv6: () => '2001:0db8:5b96:0000:0000:426f:8e17:642a',
  number: () => 0,
  number_float: () => 0.0,
  integer: () => 0,
  boolean: schema => (typeof schema.default === 'boolean' ? schema.default : true),
  null: () => null,
  any: () => null
};

export function examplePrimitive(schema: JSONSchema6) {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  const formatFunc = formatExamples[`${type}_${schema.format}`] || formatExamples[type];
  if (typeof formatFunc === 'function') {
    return formatFunc(schema);
  }
  return `Unknown: ` + type;
}

export function exampleFromSchema(schema: JSONSchema6Definition): any {
  if (schema === true || schema === false) {
    return schema;
  }
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if ('const' in schema) {
    return schema.const;
  }
  if ('default' in schema) {
    return schema.default;
  }
  if ('examples' in schema && schema.examples.length) {
    return schema.examples[0];
  }
  if (schema.enum) {
    return schema.enum[0];
  }
  if (type === 'object') {
    const result = {};
    if (!schema.properties) {
      return result;
    }
    const keys = Object.keys(schema.properties);
    for (const key of keys) {
      result[key] = exampleFromSchema(schema.properties[key]);
    }
    return result;
  }
  if (type === 'array') {
    const item = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    return [exampleFromSchema(item)];
  }
  return examplePrimitive(schema);
}

export function randomHex(len: number): string {
  const preHex = len - 1 === 0 ? 0 : 2 ** (4 * (len - 1));
  const hex = 2 ** (4 * len) - 1;
  return Math.floor(preHex + Math.random() * (hex - preHex)).toString(16);
}
