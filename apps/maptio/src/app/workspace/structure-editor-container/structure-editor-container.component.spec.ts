import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureEditorContainerComponent } from './structure-editor-container.component';

describe('StructureEditorContainerComponent', () => {
  let component: StructureEditorContainerComponent;
  let fixture: ComponentFixture<StructureEditorContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StructureEditorContainerComponent]
    });
    fixture = TestBed.createComponent(StructureEditorContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
