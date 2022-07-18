import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingBannerComponent } from './onboarding-banner.component';

describe('OnboardingBannerComponent', () => {
  let component: OnboardingBannerComponent;
  let fixture: ComponentFixture<OnboardingBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnboardingBannerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
