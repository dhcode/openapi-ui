import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { OpenapiViewerService } from './services/openapi-viewer.service';
import { OpenAPIObject, ServerObject } from 'openapi3-ts';
import { TagIndex } from './models/openapi-viewer.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'oav-openapi-viewer',
  templateUrl: './openapi-viewer.component.html',
  styleUrls: ['./openapi-viewer.scss'],
  providers: [],
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
  servers: ServerObject[] = [];

  loading = false;

  error = null;

  loadErrors = [];

  private destroy = new Subject();

  constructor(private openApiService: OpenapiViewerService) {}

  get currentServerUrl(): string {
    return this.openApiService.currentServer?.url;
  }

  ngOnInit(): void {
    this.openApiService.tagIndex.pipe(takeUntil(this.destroy)).subscribe(tagIndex => {
      this.index = tagIndex;
    });
    this.openApiService.servers.pipe(takeUntil(this.destroy)).subscribe(servers => {
      this.servers = servers;
    });
    this.openApiService.loadErrors.pipe(takeUntil(this.destroy)).subscribe(errors => {
      this.loadErrors = errors;
    });
  }

  switchServer(url: string): void {
    this.openApiService.currentServer = this.servers.find(s => s.url === url);
  }

  loadSpec(promise: Promise<OpenAPIObject>) {
    this.loading = true;
    this.error = null;
    return promise.then(
      () => {
        this.error = null;
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
