import { Component, Input, OnInit } from '@angular/core';
import { OpenAPIObject } from 'openapi3-ts';
import { Router } from '@angular/router';
import { defaultOavSettings, OavSettings } from '@dhcode/openapi-viewer';

@Component({
  templateUrl: './openapi-viewer-element.component.html',
  providers: [{ provide: OavSettings, useValue: defaultOavSettings }]
})
export class OpenapiViewerElementComponent implements OnInit {
  /**
   * An already parsed spec. Is allowed to contain $ref.
   */
  @Input() spec: OpenAPIObject;

  /**
   * Alternatively an URL to a spec to resolve.
   */
  @Input() specurl: string;

  @Input() settings: OavSettings;

  constructor(private router: Router, private settingsService: OavSettings) {}

  ngOnInit(): void {
    if (this.settings && typeof this.settings === 'string') {
      Object.assign(this.settingsService, JSON.parse(this.settings));
    } else if (this.settings && typeof this.settings === 'object') {
      Object.assign(this.settingsService, this.settings);
    }
    this.router.initialNavigation();
  }
}
