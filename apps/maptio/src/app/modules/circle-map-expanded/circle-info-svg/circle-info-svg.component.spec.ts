import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleInfoSvgComponent } from './circle-info-svg.component';

describe('CircleInfoSvgComponent', () => {
  let component: CircleInfoSvgComponent;
  let fixture: ComponentFixture<CircleInfoSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircleInfoSvgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleInfoSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
