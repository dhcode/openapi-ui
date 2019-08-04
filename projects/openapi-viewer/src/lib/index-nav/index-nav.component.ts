import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { OperationsItem, PathItem, TagIndex } from '../openapi-viewer.model';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { OavSettings } from '../openapi-viewer.settings';

@Component({
  selector: 'oav-index-nav',
  templateUrl: './index-nav.component.html'
})
export class IndexNavComponent implements OnInit, OnDestroy {
  openTags = new Set<string>();

  @Input() index: TagIndex[];

  showHoverLabel: boolean;

  private sub: Subscription;

  constructor(private router: Router, @Optional() private oavSettings: OavSettings) {
    if (!this.oavSettings) {
      this.oavSettings = OavSettings.default;
    }
    this.showHoverLabel = !!this.oavSettings.indexHoverLabel;
  }

  ngOnInit() {
    this.checkOpenTags(this.router.routerState.snapshot.url);
    this.sub = this.router.events.pipe(filter(ev => ev instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.checkOpenTags(event.url);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkOpenTags(url: string) {
    console.log('nav url', url);
    if (url.match(/\/(.+)\/(.+)/)) {
      const tag = RegExp.$1;
      this.openTags.add(tag);
    }
  }

  getPrimaryLabel(op: OperationsItem, pathItem: PathItem): string {
    return getLabel(op, pathItem, this.oavSettings.indexPrimaryLabel);
  }

  getHoverLabel(op: OperationsItem, pathItem: PathItem): string {
    return getLabel(op, pathItem, this.oavSettings.indexHoverLabel);
  }
}

function getLabel(op: OperationsItem, pathItem: PathItem, fields: string[]): string {
  for (const field of fields) {
    if (field === 'path') {
      return pathItem.path;
    }
    if (op.operation[field]) {
      return op.operation[field];
    }
  }
  return '';
}
