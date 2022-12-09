import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgZoomPanComponent } from './svg-zoom-pan.component';

describe('SvgZoomPanComponent', () => {
  let component: SvgZoomPanComponent;
  let fixture: ComponentFixture<SvgZoomPanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SvgZoomPanComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgZoomPanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
