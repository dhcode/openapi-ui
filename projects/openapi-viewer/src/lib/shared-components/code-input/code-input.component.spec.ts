import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeInputComponent } from './code-input.component';
import { AceModule } from 'ngx-ace-wrapper';

describe('CodeInputComponent', () => {
  let component: CodeInputComponent;
  let fixture: ComponentFixture<CodeInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AceModule],
      declarations: [CodeInputComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
