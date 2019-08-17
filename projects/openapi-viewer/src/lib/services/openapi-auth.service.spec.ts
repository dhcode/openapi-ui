import { TestBed } from '@angular/core/testing';

import { OpenapiAuthService } from './openapi-auth.service';

describe('OpenapiAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenapiAuthService = TestBed.get(OpenapiAuthService);
    expect(service).toBeTruthy();
  });
});
