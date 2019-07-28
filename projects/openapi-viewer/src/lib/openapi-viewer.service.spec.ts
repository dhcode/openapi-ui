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

  it('should be created', () => {
    const service: OpenapiViewerService = TestBed.get(OpenapiViewerService);
    expect(service).toBeTruthy();
    service.spec = require('../../assets/swagger.json');

    service.tagIndex.subscribe(index => {
      expect(index.length).toBe(3);
    });
  });
});
