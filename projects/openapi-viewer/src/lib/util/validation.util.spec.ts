import { getValidationFunction } from './validation.util';

describe('Validation util', () => {
  const testValue = num => ({
    num
  });

  it('should validate int32', () => {
    const schema = {
      type: 'object',
      properties: {
        num: {
          type: 'integer',
          format: 'int32'
        }
      }
    };

    const validate = getValidationFunction(schema);
    const result = validate(testValue(1234));
    expect(result).toBe(true);
    expect(validate(testValue(2 ** 31))).toBe(true);
    expect(validate(testValue(2 ** 40))).toBe(false);
    expect(validate(testValue(2 ** 31 * -1))).toBe(true);
    expect(validate(testValue(0))).toBe(true);
    expect(validate(testValue(NaN))).toBe(false);
    expect(validate(testValue('a'))).toBe(false);
    expect(validate(testValue({}))).toBe(false);
    expect(validate(testValue([]))).toBe(false);
  });

  it('should validate int64', () => {
    const schema = {
      type: 'object',
      properties: {
        num: {
          type: 'integer',
          format: 'int64'
        }
      }
    };

    const validate = getValidationFunction(schema);
    expect(validate(testValue(1234))).toBe(true);
    expect(validate(testValue(2 ** 31))).toBe(true);
    expect(validate(testValue(2 ** 40))).toBe(true);
    expect(validate(testValue(2 ** 40 * -1))).toBe(true);
    expect(validate(testValue(0))).toBe(true);
    expect(validate(testValue(NaN))).toBe(false);
    expect(validate(testValue('a'))).toBe(false);
    expect(validate(testValue({}))).toBe(false);
    expect(validate(testValue([]))).toBe(false);
  });

  it('should validate float', () => {
    const schema = {
      type: 'object',
      properties: {
        num: {
          type: 'number',
          format: 'float'
        }
      }
    };

    const validate = getValidationFunction(schema);
    expect(validate(testValue(1234))).toBe(true);
    expect(validate(testValue(2.43))).toBe(true);
    expect(validate(testValue(-4.53))).toBe(true);
    expect(validate(testValue(0))).toBe(true);
    expect(validate(testValue(NaN))).toBe(false);
    expect(validate(testValue('a'))).toBe(false);
    expect(validate(testValue({}))).toBe(false);
    expect(validate(testValue([]))).toBe(false);
  });

  it('should validate double', () => {
    const schema = {
      type: 'object',
      properties: {
        num: {
          type: 'number',
          format: 'double'
        }
      }
    };

    const validate = getValidationFunction(schema);
    expect(validate(testValue(1234))).toBe(true);
    expect(validate(testValue(2.43))).toBe(true);
    expect(validate(testValue(-4.53))).toBe(true);
    expect(validate(testValue(0))).toBe(true);
    expect(validate(testValue(NaN))).toBe(false);
    expect(validate(testValue('a'))).toBe(false);
    expect(validate(testValue({}))).toBe(false);
    expect(validate(testValue([]))).toBe(false);
  });

  it('should validate base64', () => {
    const schema = {
      type: 'object',
      properties: {
        num: {
          type: 'string',
          format: 'byte'
        }
      }
    };

    const validate = getValidationFunction(schema);
    expect(validate(testValue('YW55IGNhcm5hbCBwbGVhc3VyZS4='))).toBe(true);
    expect(validate(testValue('YW55IGNhcm5hbCBwbGVhc3VyZQ=='))).toBe(true);
    expect(validate(testValue('YW55IGNhcm5hbCBwbGVhc3Vy'))).toBe(true);
    expect(validate(testValue('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='))).toBe(true);
    expect(validate(testValue('?f'))).toBe(false);
  });
});
