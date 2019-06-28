import { getDisplayMode } from './parameter-input.util';
import { ParameterObject } from 'openapi3-ts';

describe('parameter-input util', () => {

  it('should have correct array primitive check', () => {
    const param: ParameterObject = {
      name: 'tags',
      in: 'query',
      description: 'Tags to filter by',
      required: true,
      type: 'array',
      items: {
        type: 'string'
      },
      collectionFormat: 'multi'
    };
    const displayMode = getDisplayMode(param);
    expect(displayMode).toBe('arrayWithPrimitive');
  });

});
