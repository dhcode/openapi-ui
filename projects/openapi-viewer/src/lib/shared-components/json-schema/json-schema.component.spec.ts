import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonSchemaComponent } from './json-schema.component';

describe('JsonSchemaComponent', () => {
  let component: JsonSchemaComponent;
  let fixture: ComponentFixture<JsonSchemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JsonSchemaComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
