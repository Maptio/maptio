import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricingInfoComponent } from './pricing-info.component';

describe('PricingInfoComponent', () => {
  let component: PricingInfoComponent;
  let fixture: ComponentFixture<PricingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
