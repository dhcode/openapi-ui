import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TagIndex } from '../openapi-viewer.model';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'oav-index-nav',
  templateUrl: './index-nav.component.html'
})
export class IndexNavComponent implements OnInit, OnDestroy {
  openTags = new Set<string>();

  @Input() index: TagIndex[];

  private sub: Subscription;

  constructor(private router: Router) {}

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
}
