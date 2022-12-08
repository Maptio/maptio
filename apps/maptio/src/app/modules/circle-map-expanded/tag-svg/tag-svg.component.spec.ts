import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSvgComponent } from './tag-svg.component';

describe('TagSvgComponent', () => {
  let component: TagSvgComponent;
  let fixture: ComponentFixture<TagSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagSvgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
