import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharingComponent } from './sharing.component';

describe('SharingComponent', () => {
  let component: SharingComponent;
  let fixture: ComponentFixture<SharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
