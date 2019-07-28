import { Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, TemplateRef } from '@angular/core';
import { TabNavItemDirective } from './tab-nav-item.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'oav-tab-nav',
  templateUrl: './tab-nav.component.html',
  styles: []
})
export class TabNavComponent implements OnInit, OnDestroy {
  tabs: TabNavItemDirective[] = [];

  @Output() tabChange = new EventEmitter<string>();
  @Input() tab: string;

  tabContent: TemplateRef<any>;

  private destroy = new Subject();

  constructor() {}

  @ContentChildren(TabNavItemDirective)
  set tabList(tabs: QueryList<TabNavItemDirective>) {
    if (tabs) {
      this.tabs = tabs.toArray();
      this.checkForActiveTab();
    }
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy.complete();
  }

  private checkForActiveTab() {
    if (!this.tabs.find(t => t.active) && this.tabs.length) {
      if (this.tab) {
        this.showTab(this.tab);
      } else {
        this.showTab(this.tabs[0].id);
      }
    }
  }

  private showTab(id: string, notify = false) {
    for (const tab of this.tabs) {
      if (tab.active && tab.id !== id) {
        tab.active = false;
      }
      if (!tab.active && tab.id === id) {
        tab.active = true;
        this.tab = tab.id;
        this.tabContent = tab.templateRef;
        if (notify) {
          this.tabChange.next(tab.id);
        }
      }
    }
  }
}
