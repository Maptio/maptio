import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleInfoComponent } from './circle-info.component';

describe('CircleInfoComponent', () => {
  let component: CircleInfoComponent;
  let fixture: ComponentFixture<CircleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CircleInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
