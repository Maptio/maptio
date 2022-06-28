import { UnauthorizedComponent } from './unauthorized.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('unauthorized.component.ts', () => {
  let component: UnauthorizedComponent;
  let target: ComponentFixture<UnauthorizedComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [UnauthorizedComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(UnauthorizedComponent);
    component = target.componentInstance;

    target.detectChanges(); // trigger initial data binding
  });

  it('should create component', () => {
    expect(component instanceof UnauthorizedComponent).toBeTruthy();
  });
});
