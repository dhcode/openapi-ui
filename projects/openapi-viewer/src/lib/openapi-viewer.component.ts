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
  /**
   * An already parsed spec. Is allowed to contain $ref.
   */
  @Input() spec: OpenAPIObject;

  /**
   * Alternatively an URL to a spec to resolve.
   */
  @Input() specUrl: string;

  index: TagIndex[] = [];

  loading = false;

  error = null;

  loadErrors = [];

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
    this.openApiService.loadErrors.pipe(takeUntil(this.destroy)).subscribe(errors => {
      this.loadErrors = errors;
    });
  }

  loadSpec(promise: Promise<OpenAPIObject>) {
    this.loading = true;
    this.error = null;
    return promise.then(
      () => {
        this.loading = false;
      },
      e => {
        this.loading = false;
        this.error = e.message;
        console.error(e);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.spec || changes.specUrl) {
      if (this.spec) {
        this.loadSpec(this.openApiService.loadSpec(this.spec));
      } else if (this.specUrl) {
        this.loadSpec(this.openApiService.loadSpecByUrl(this.specUrl));
      } else {
        this.openApiService.resetSpec();
      }
    }
  }
}
