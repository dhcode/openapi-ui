import { exampleFromSchema, formatExampleDate, getJsonString, getStarMatcher, randomHex } from './data-generator.util';

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
});
