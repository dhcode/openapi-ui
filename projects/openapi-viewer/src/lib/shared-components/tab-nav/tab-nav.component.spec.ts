import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabNavComponent } from './tab-nav.component';
import { TabNavItemDirective } from './tab-nav-item.directive';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TemplateOutletComponent } from '../template-outlet/template-outlet.component';

@Component({
  template: `
    <oav-tab-nav (tabChange)="tabChange($event)">
      <div *oavTabNavItem="'Tab 1'; id: 'tab1'">TabContent1</div>
      <div *oavTabNavItem="'Tab 2'; id: 'tab2'">TabContent2</div>
    </oav-tab-nav>
  `
})
class TestComponent {
  tabChange(id: string) {
    console.log('tabChange', id);
  }
}

describe('TabNavComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabNavComponent, TabNavItemDirective, TestComponent, TemplateOutletComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create tab nav', () => {
    expect(component).toBeTruthy();

    const tabNavDebug = fixture.debugElement.query(By.directive(TabNavComponent));
    expect(tabNavDebug).toBeTruthy();

    const tabNav = tabNavDebug.componentInstance as TabNavComponent;
    expect(tabNav.tabs.length).toBe(2);
    expect(tabNav.tabs[0].label).toBe('Tab 1');
    expect(tabNav.tabs[1].label).toBe('Tab 2');
    expect(tabNav.tab).toBe('tab1');
    expect(tabNav.tabContent).toBeTruthy();

    const tabElements = tabNavDebug.queryAll(By.css('nav a'));
    expect(tabElements.length).toBe(2);
    expect(tabElements[0].nativeElement.className).toBe('active');
    expect(tabElements[0].nativeElement.textContent).toBe('Tab 1');
    expect(tabElements[1].nativeElement.textContent).toBe('Tab 2');

    const tabContent = tabNavDebug.query(By.css('.oav-tab-content'));
    expect(tabContent.nativeElement.textContent).toBe('TabContent1');
  });

  it('should switch tab', () => {
    const tabNavDebug = fixture.debugElement.query(By.directive(TabNavComponent));
    expect(tabNavDebug).toBeTruthy();

    const tabNav = tabNavDebug.componentInstance as TabNavComponent;
    expect(tabNav.tab).toBe('tab1');

    const tabElements = tabNavDebug.queryAll(By.css('nav a'));
    tabElements[1].nativeElement.click();
    expect(tabNav.tab).toBe('tab2');

    fixture.detectChanges();

    expect(tabElements[0].nativeElement.className).toBe('');
    expect(tabElements[1].nativeElement.className).toBe('active');

    const tabContent = tabNavDebug.query(By.css('.oav-tab-content'));
    expect(tabContent.nativeElement.textContent).toBe('TabContent2');
  });
});
