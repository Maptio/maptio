import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapContainerComponent } from './map-container.component';

describe('MapContainerComponent', () => {
  let component: MapContainerComponent;
  let fixture: ComponentFixture<MapContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
