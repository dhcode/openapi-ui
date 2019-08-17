import { Component, Input } from '@angular/core';
import { HttpMethod } from '../../models/openapi-viewer.model';

@Component({
  selector: 'oav-method',
  templateUrl: './method.component.html'
})
export class MethodComponent {
  @Input() method: HttpMethod | string;
}
