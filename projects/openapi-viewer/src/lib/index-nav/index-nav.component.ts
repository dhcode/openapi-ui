import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges
} from '@angular/core';
import { OperationsItem, PathItem, TagIndex } from '../models/openapi-viewer.model';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { defaultOavSettings, OavSettings } from '../models/openapi-viewer.settings';

@Component({
  selector: 'oav-index-nav',
  templateUrl: './index-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexNavComponent implements OnInit, OnDestroy {
  openTags = new Set<string>();

  @Input() index: TagIndex[];

  showHoverLabel: boolean;
  showAuthentication: boolean;
  showModelsOverview: boolean;

  private sub: Subscription;

  constructor(private router: Router, @Optional() private oavSettings: OavSettings, private cd: ChangeDetectorRef) {
    if (!this.oavSettings) {
      this.oavSettings = defaultOavSettings;
    }
    this.showHoverLabel = !!this.oavSettings.indexHoverLabel;
    this.showAuthentication = this.oavSettings.enableAuthentication;
    this.showModelsOverview = this.oavSettings.enableModelsOverview;
  }

  ngOnInit() {
    this.checkOpenTags(this.router.routerState.snapshot.url);
    this.sub = this.router.events.pipe(filter(ev => ev instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.checkOpenTags(event.url);
      this.cd.markForCheck();
    });
    if (this.index && this.index.length === 1) {
      this.openTags.add(this.index[0].tag.name);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  checkOpenTags(url: string) {
    if (url.match(/\/(.+)\/(.+)/)) {
      const tag = RegExp.$1;
      this.openTags.add(tag);
    }
  }
}
