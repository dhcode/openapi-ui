import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OpenapiViewerService } from '../services/openapi-viewer.service';
import { combineLatest, Subscription } from 'rxjs';
import { OperationsItem, PathItem, TagIndex } from '../models/openapi-viewer.model';

@Component({
  selector: 'oav-operation-view',
  templateUrl: './operation-view.component.html',
  styles: []
})
export class OperationViewComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  pathItem: PathItem = null;
  operationItem: OperationsItem = null;
  tag = null;

  error: 'noTagFound' | 'noOperationFound' = null;

  constructor(private route: ActivatedRoute, private openApiService: OpenapiViewerService) {}

  ngOnInit() {
    this.sub = combineLatest(this.route.params, this.openApiService.tagIndex).subscribe(([params, index]) => {
      this.loadData(index, params.tag, params.opId);
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadData(index: TagIndex[], tag: string, opId: string) {
    this.pathItem = null;
    this.operationItem = null;
    this.tag = tag;
    this.error = null;
    const tagIndex = index.find(idx => idx.tag.name === tag);
    if (!tagIndex) {
      this.error = 'noTagFound';
      return;
    }
    for (const pi of tagIndex.paths) {
      const operationItem = pi.operations.find(op => op.operation.operationId === opId);
      if (operationItem) {
        this.pathItem = pi;
        this.operationItem = operationItem;
      }
    }
    if (!this.operationItem) {
      this.error = 'noOperationFound';
    }
  }
}
