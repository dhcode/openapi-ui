import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'oav-method-header',
  templateUrl: './method-header.component.html'
})
export class MethodHeaderComponent implements OnInit {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  @Input() fragment: string;
  @Input() method: string;
  @Input() path: string;

  constructor() {}

  ngOnInit() {}

  toggleOpen() {
    this.open = !this.open;
    this.openChange.next(this.open);
  }
}
