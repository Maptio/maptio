import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleMapComponent } from './circle-map.component';

describe('CircleMapComponent', () => {
  let component: CircleMapComponent;
  let fixture: ComponentFixture<CircleMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircleMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
