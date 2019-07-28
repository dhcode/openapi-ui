import { TestBed } from '@angular/core/testing';

import { OpenapiViewerService } from './openapi-viewer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OpenapiViewerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OpenapiViewerService]
    })
  );

  it('should be created', async () => {
    const service: OpenapiViewerService = TestBed.get(OpenapiViewerService);
    expect(service).toBeTruthy();
    await service.loadSpec(require('../../assets/swagger.json'));
    const sub = service.tagIndex.subscribe(index => {
      expect(index.length).toBe(3);
    });
    sub.unsubscribe();
  });
});
