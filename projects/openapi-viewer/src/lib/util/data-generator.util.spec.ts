import {
  exampleFromSchema,
  formatExampleDate,
  getJsonString,
  getStarMatcher,
  parseQueryString,
  randomHex,
  serializeQueryParams
} from './data-generator.util';

describe('Data Generator', () => {
  it('should generate random hex', () => {
    for (let i = 1; i <= 16; i++) {
      expect(randomHex(i).length).toBe(i);
    }
  });

  it('should generate example', () => {
    const testSchema = {
      type: 'object',
      properties: {
        id: { type: 'integer', format: 'int64' },
        petId: { type: 'integer', format: 'int64' },
        quantity: { type: 'integer', format: 'int32' },
        shipDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', description: 'Order Status', enum: ['placed', 'approved', 'delivered'] },
        complete: { type: 'boolean', default: false }
      }
    };

    const example = exampleFromSchema(testSchema as any);
    expect(example).toEqual({
      id: 0,
      petId: 0,
      quantity: 0,
      shipDate: formatExampleDate.toISOString(),
      status: 'placed',
      complete: false
    });
  });

  it('should match patterns', () => {
    expect(getStarMatcher('ct/*').test('ct/hey')).toBe(true);
    expect(getStarMatcher('ct/*').test('as/hey')).toBe(false);
    expect(getStarMatcher('ct/*.*').test('ct/hey')).toBe(false);
    expect(getStarMatcher('ct/*.*').test('ct/hey.a')).toBe(true);
  });

  it('should get data as json string', () => {
    expect(getJsonString({ a: 3 })).toBe('{\n  "a": 3\n}');
    expect(getJsonString('{"a":3}')).toBe('{"a":3}');
  });

  it('should serialize query string', () => {
    const params = {
      'a&b': 'c=6',
      test: '4533'
    };
    const str = serializeQueryParams(params);
    expect(str).toBe('a%26b=c%3D6&test=4533');
  });

  it('should parse query string', () => {
    const str = 'a%26b=c%3D6&test=4533';
    const queryParams = parseQueryString(str);
    expect(queryParams).toEqual({
      'a&b': 'c=6',
      test: '4533'
    });
  });
});
