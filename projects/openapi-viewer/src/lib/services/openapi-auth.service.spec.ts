import { TestBed } from '@angular/core/testing';

import { OpenapiAuthService } from './openapi-auth.service';

describe('OpenapiAuthService', () => {
  const spec = require('../../../assets/swagger.json');
  let service: OpenapiAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenapiAuthService]
    });
    service = TestBed.get(OpenapiAuthService);
    window.sessionStorage.clear();
  });

  it('should detect schemes', async () => {
    service.identifySchemes(spec);

    const sub = service.securitySchemes.subscribe(schemes => {
      expect(schemes.length).toBe(2);
      const scheme1 = schemes[0];
      expect(scheme1.name).toBe('petstore_auth');
      expect(scheme1.securityScheme).toEqual(spec.securityDefinitions.petstore_auth);
      expect(scheme1.authenticated).toBe(false);
      expect(scheme1.credentials).toBe(null);
      expect(scheme1.remember).toBe(false);

      const scheme2 = schemes[1];
      expect(scheme2.name).toBe('api_key');
      expect(scheme2.securityScheme).toEqual(spec.securityDefinitions.api_key);
      expect(scheme2.authenticated).toBe(false);
      expect(scheme2.credentials).toBe(null);
      expect(scheme2.remember).toBe(false);
    });
    sub.unsubscribe();
  });

  it('should save and load remembered credentials', () => {
    service.identifySchemes(spec);

    service.updateCredentials('api_key', 'secret', true, true);
    const schema = service.getSchema('api_key');
    expect(schema.credentials).toBe('secret');
    expect(schema.authenticated).toBe(true);
    expect(schema.remember).toBe(true);

    service.identifySchemes(spec);
    const schema2 = service.getSchema('api_key');
    expect(schema2.credentials).toBe('secret');
    expect(schema2.authenticated).toBe(true);
    expect(schema2.remember).toBe(true);

    service.updateCredentials('api_key', '', false, true);
    const schema3 = service.getSchema('api_key');
    expect(schema3.credentials).toBe(null);
    expect(schema3.authenticated).toBe(false);
    expect(schema3.remember).toBe(false);

    service.identifySchemes(spec);
    const schema4 = service.getSchema('api_key');
    expect(schema4.credentials).toBe(null);
    expect(schema4.authenticated).toBe(false);
    expect(schema4.remember).toBe(false);
  });

  it('should save and load not remembered credentials', () => {
    service.identifySchemes(spec);

    service.updateCredentials('api_key', 'secret', true, false);
    const schema1 = service.getSchema('api_key');
    expect(schema1.credentials).toBe('secret');
    expect(schema1.authenticated).toBe(true);
    expect(schema1.remember).toBe(false);

    service.identifySchemes(spec);
    const schema2 = service.getSchema('api_key');
    expect(schema2.credentials).toBe(null);
    expect(schema2.authenticated).toBe(false);
    expect(schema2.remember).toBe(false);
  });

  it('should should get auth status', () => {
    service.identifySchemes(spec);

    expect(service.getAuthStatus(undefined)).toBe('none');
    expect(service.getAuthStatus(null)).toBe('none');
    expect(service.getAuthStatus([])).toBe('none');
    expect(service.getAuthStatus([{}])).toBe('none');
    expect(service.getAuthStatus([{}, {}])).toBe('none');
    expect(service.getAuthStatus([{ api_key: [] }, {}])).toBe('required');
    expect(service.getAuthStatus([{ api_key: [] }])).toBe('required');
    expect(service.getAuthStatus([{ api_key: [] }, { petstore_auth: [] }])).toBe('required');

    service.updateCredentials('api_key', 'secret', true, false);
    expect(service.getAuthStatus([{ api_key: [] }])).toBe('ok');
    expect(service.getAuthStatus([{ api_key: [] }, {}])).toBe('ok');
    expect(service.getAuthStatus([{ api_key: [], petstore_auth: [] }])).toBe('required');
    expect(service.getAuthStatus([{ api_key: [] }, { petstore_auth: [] }])).toBe('ok');
  });

  it('should get required schemes', () => {
    service.identifySchemes(spec);
    expect(service.getRequiredSchemes(undefined)).toEqual([]);
    expect(service.getRequiredSchemes(null)).toEqual([]);
    expect(service.getRequiredSchemes([])).toEqual([]);

    const requiredSchemes = service.getRequiredSchemes([{ api_key: [] }]);
    expect(requiredSchemes.length).toBe(1);
    expect(requiredSchemes[0].length).toBe(1);
    expect(requiredSchemes[0][0].name).toBe('api_key');
    expect(requiredSchemes[0][0].authenticated).toBe(false);
    expect(requiredSchemes[0][0].scopes).toEqual([]);
    expect(requiredSchemes[0][0].securityScheme).toEqual(spec.securityDefinitions.api_key);
  });
});
