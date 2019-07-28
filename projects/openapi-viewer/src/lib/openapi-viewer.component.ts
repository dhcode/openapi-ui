import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { OpenapiViewerService } from './openapi-viewer.service';
import { OpenAPIObject } from 'openapi3-ts';
import { ActivatedRoute, Router } from '@angular/router';
import { TagIndex } from './openapi-viewer.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'oav-openapi-viewer',
  templateUrl: './openapi-viewer.component.html',
  styleUrls: ['./openapi-viewer.scss'],
  providers: [OpenapiViewerService],
  encapsulation: ViewEncapsulation.None
})
export class OpenapiViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() spec: OpenAPIObject;

  index: TagIndex[] = [];

  loading = false;

  error = null;

  openFragments = new Set();

  private destroy = new Subject();

  constructor(private openApiService: OpenapiViewerService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.length) {
        this.openFragments.add(fragment.split('/', 2).shift());
      }
    });
    this.openApiService.tagIndex.pipe(takeUntil(this.destroy)).subscribe(tagIndex => {
      this.index = tagIndex;
    });
  }

  ngOnDestroy(): void {
    this.destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.spec) {
      if (changes.spec.currentValue) {
        this.loading = true;
        this.error = null;
        this.openApiService.loadSpec(changes.spec.currentValue).then(
          () => {
            this.loading = false;
          },
          e => {
            this.loading = false;
            this.error = e.message;
            console.error(e);
          }
        );
      } else {
        this.openApiService.resetSpec();
      }
    }
  }
}
