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

    const tags = service.getTags();
    expect(tags.length).toBe(3);

    const paths = service.getPathsByTag('pet');
    expect(paths.length).toBe(5);

    const pathItem = paths.find(p => p.path === '/pet');
    expect(pathItem.operations.length).toBe(2);
  });
});
