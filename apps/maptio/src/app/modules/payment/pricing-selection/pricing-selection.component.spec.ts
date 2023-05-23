import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricingSelectionComponent } from './pricing-selection.component';

describe('PricingSelectionComponent', () => {
  let component: PricingSelectionComponent;
  let fixture: ComponentFixture<PricingSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricingSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
