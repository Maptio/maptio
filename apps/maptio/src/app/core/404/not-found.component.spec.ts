import { NotFoundComponent } from './not-found.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('not-found.component.ts', () => {
  let component: NotFoundComponent;
  let target: ComponentFixture<NotFoundComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NotFoundComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(NotFoundComponent);
    component = target.componentInstance;

    target.detectChanges(); // trigger initial data binding
  });

  it('should create component', () => {
    expect(component instanceof NotFoundComponent).toBeTruthy();
  });
});
