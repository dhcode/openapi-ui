import { Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { OpenapiViewerService } from './openapi-viewer.service';
import { OpenAPIObject, TagObject } from 'openapi3-ts';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'oav-openapi-viewer',
  templateUrl: './openapi-viewer.component.html',
  styleUrls: ['./openapi-viewer.scss'],
  providers: [OpenapiViewerService],
  encapsulation: ViewEncapsulation.None
})
export class OpenapiViewerComponent implements OnInit, OnChanges {
  @Input() spec: OpenAPIObject;

  tags: TagObject[] = [];

  loading = false;

  openFragments = new Set();

  constructor(private openApiService: OpenapiViewerService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.length) {
        this.openFragments.add(fragment.split('/', 2).shift());
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.spec) {
      if (changes.spec.currentValue) {
        this.loading = true;
        this.tags = [];
        this.openApiService.loadSpec(changes.spec.currentValue).then(
          () => {
            this.loading = false;
            this.loadTags();
          },
          e => {
            this.loading = false;
            console.error(e);
          }
        );
      } else {
        this.openApiService.resetSpec();
      }
    }
  }

  loadTags() {
    this.tags = this.openApiService.getTags();
  }

  toggleTag(tag) {
    if (this.openFragments.has(tag)) {
      this.openFragments.delete(tag);
      this.router.navigate([], { fragment: '' });
    } else {
      this.router.navigate([], { fragment: tag });
    }
  }
}
