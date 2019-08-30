import { TestBed } from '@angular/core/testing';

import { OpenapiViewerService } from './openapi-viewer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OpenapiAuthService } from './openapi-auth.service';

describe('OpenapiViewerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OpenapiAuthService, OpenapiViewerService]
    })
  );

  it('should identify the tags', async () => {
    const service: OpenapiViewerService = TestBed.get(OpenapiViewerService);
    expect(service).toBeTruthy();
    await service.loadSpec(require('../../../assets/swagger.json'));
    const sub = service.tagIndex.subscribe(index => {
      expect(index.length).toBe(3);
    });
    sub.unsubscribe();
  });

  it('should save and restore parameters', () => {
    const service: OpenapiViewerService = TestBed.get(OpenapiViewerService);
    const params = { a: 1, b: 2 };

    expect(service.loadOperationParameters('test')).toBe(undefined);

    service.saveOperationParameters('test', params);

    expect(service.loadOperationParameters('test')).toBe(params);
  });

  it('should create request', async () => {
    const service: OpenapiViewerService = TestBed.get(OpenapiViewerService);
    await service.loadSpec(require('../../../assets/swagger.json'));

    const request = service.createRequest('getPetById', { petId: 5 }, null, null, 'application/json');
    expect(request.url).toBe('https://petstore.swagger.io/v2/pet/5');
    expect(request.method).toBe('GET');
    expect(request.body).toBe(undefined);
    expect(request.headers).toEqual({
      accept: 'application/json'
    });
  });
});
