import { Component, OnDestroy, OnInit } from '@angular/core';
import { OpenapiViewerService } from '../openapi-viewer.service';
import { combineLatest, Subscription } from 'rxjs';
import { TagIndex } from '../openapi-viewer.model';
import { OpenAPIObject } from 'openapi3-ts';

@Component({
  selector: 'oav-overview-view',
  templateUrl: './overview-view.component.html',
  styles: []
})
export class OverviewViewComponent implements OnInit, OnDestroy {
  index: TagIndex[] = [];

  spec: OpenAPIObject = null;

  private sub: Subscription;

  constructor(private openApiService: OpenapiViewerService) {}

  ngOnInit() {
    this.sub = combineLatest(this.openApiService.spec, this.openApiService.tagIndex).subscribe(([spec, index]) => {
      this.spec = spec;
      this.index = index;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
