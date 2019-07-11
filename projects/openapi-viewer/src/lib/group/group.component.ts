import { Component, Input, OnInit } from '@angular/core';
import { OpenapiViewerService } from '../openapi-viewer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationsItem, PathItem } from '../openapi-viewer.model';

@Component({
  selector: 'oav-group',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {
  @Input() tag: string;

  paths: PathItem[] = [];

  openOperations = new Set();

  constructor(private openApiService: OpenapiViewerService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.paths = this.openApiService.getPathsByTag(this.tag);
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.length) {
        const parts = fragment.split('/');
        if (parts[0] === this.tag && parts[1]) {
          console.log('open fragment', parts.slice(1));
          this.openOperations.add(parts.slice(1).join('/'));
        }
      }
    });
  }

  toggleOp(opItem: OperationsItem) {
    const opId = opItem.operation.operationId;
    if (this.openOperations.has(opId)) {
      this.openOperations.delete(opId);
      this.router.navigate([], { fragment: this.tag });
    } else {
      this.router.navigate([], { fragment: this.getFragment(opItem) });
    }
  }

  getFragment(opItem: OperationsItem) {
    return this.tag + '/' + opItem.operation.operationId;
  }
}
