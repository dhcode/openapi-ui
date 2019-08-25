import * as Ajv from 'ajv';
import { ValidateFunction } from 'ajv';

const ajv = new Ajv({
  unknownFormats: 'ignore'
});
ajv.addFormat('int32', {
  type: 'number',
  validate: data => !isNaN(data) && data % 1 === 0 && data <= 2 ** 31 && data >= 2 ** 31 * -1
});
ajv.addFormat('int64', {
  type: 'number',
  validate: data => !isNaN(data) && data % 1 === 0
});
ajv.addFormat('float', {
  type: 'number',
  validate: data => !isNaN(data)
});
ajv.addFormat('double', {
  type: 'number',
  validate: data => !isNaN(data)
});
ajv.addFormat('byte', {
  type: 'string',
  validate: data => /^[0-9A-Za-z+/]*=?=?$/.test(data)
});

export function getValidationFunction(schema): ValidateFunction {
  return ajv.compile(schema);
}
