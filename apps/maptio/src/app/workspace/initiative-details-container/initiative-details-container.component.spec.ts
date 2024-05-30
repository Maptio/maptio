import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiativeDetailsContainerComponent } from './initiative-details-container.component';

describe('InitiativeDetailsContainerComponent', () => {
  let component: InitiativeDetailsContainerComponent;
  let fixture: ComponentFixture<InitiativeDetailsContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InitiativeDetailsContainerComponent]
    });
    fixture = TestBed.createComponent(InitiativeDetailsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
