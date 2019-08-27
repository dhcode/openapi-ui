import { identifySchemaInfo } from './schema-info.util';
import Swagger from 'swagger-client';

describe('Schema Info Util', () => {
  let spec;
  beforeEach(async () => {
    const result = await Swagger.resolve({ spec: require('../../../assets/swagger.json') });
    spec = result.spec;
  });

  it('should identify schema', () => {
    const info = identifySchemaInfo('Pet', spec.definitions.Pet);
    console.log(info);
    expect(info.name).toBe('Pet');
    expect(info.type).toBe('object');
    expect(info.schema).toBe(spec.definitions.Pet);
    expect(info.properties.length).toBe(6);
    expect(info.additionalModels.length).toBe(2);

    const category = info.additionalModels[0];
    expect(category.name).toBe('Category');
    expect(category.type).toBe('object');
    expect(category.properties.length).toBe(2);

    const tag = info.additionalModels[1];
    expect(tag.name).toBe('Tag');
    expect(tag.type).toBe('object');
    expect(tag.properties.length).toBe(2);
  });

  it('should identify schema with array reference', () => {
    const testSpec: any = {
      type: 'object',
      properties: {
        executions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              }
            },
            $$ref: '#/definitions/Execution'
          }
        }
      }
    };
    const info = identifySchemaInfo('Status', testSpec);
    expect(info.name).toBe('Status');
    expect(info.type).toBe('object');
    expect(info.schema).toBe(testSpec);
    expect(info.properties.length).toBe(1);
    expect(info.additionalModels.length).toBe(1);

    const prop = info.properties[0];
    expect(prop.name).toBe('executions');
    expect(prop.type).toBe('array');
    expect(prop.properties.length).toBe(1);

    const itemProp = prop.properties[0];
    expect(itemProp.name).toBe('');
    expect(itemProp.type).toBe('object');
    expect(itemProp.modelName).toBe('Execution');

    const execution = info.additionalModels[0];
    expect(execution.name).toBe('Execution');
    expect(execution.type).toBe('object');
    expect(execution.properties.length).toBe(1);
  });

  it('should identify schema in right order', () => {
    const testSpec: any = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          info: {
            type: 'object',
            properties: {
              message: {
                type: 'string'
              }
            },
            $$ref: '#/definitions/Info'
          }
        },
        $$ref: '#/definitions/Item'
      }
    };
    const info = identifySchemaInfo('List', testSpec);
    expect(info.name).toBe('List');
    expect(info.type).toBe('array');
    expect(info.schema).toBe(testSpec);
    expect(info.properties.length).toBe(1);
    expect(info.additionalModels.length).toBe(2);

    const item = info.additionalModels[0];
    expect(item.name).toBe('Item');

    const infoO = info.additionalModels[1];
    expect(infoO.name).toBe('Info');
  });
});
