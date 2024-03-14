import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionSidePanelComponent } from './accordion-side-panel.component';

describe('AccordionSidePanelComponent', () => {
  let component: AccordionSidePanelComponent;
  let fixture: ComponentFixture<AccordionSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionSidePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
