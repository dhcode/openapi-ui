import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeInputComponent } from './code-input.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

describe('CodeInputComponent', () => {
  let component: CodeInputComponent;
  let fixture: ComponentFixture<CodeInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CodemirrorModule],
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
