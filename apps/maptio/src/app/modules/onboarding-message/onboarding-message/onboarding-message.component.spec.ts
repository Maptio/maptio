import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingMessageComponent } from './onboarding-message.component';

describe('OnboardingMessageComponent', () => {
  let component: OnboardingMessageComponent;
  let fixture: ComponentFixture<OnboardingMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
