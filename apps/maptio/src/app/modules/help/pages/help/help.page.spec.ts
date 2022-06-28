import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HelpComponent } from './help.page';
import { CoreModule } from '../../../../core/core.module';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { AnalyticsModule } from '../../../../core/analytics.module';

describe('help.component.ts', () => {
  let component: HelpComponent;
  let target: ComponentFixture<HelpComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          CoreModule,
          SharedModule.forRoot(),
          AnalyticsModule,
        ],
        declarations: [HelpComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(HelpComponent);
    component = target.componentInstance;

    target.detectChanges(); // trigger initial data binding
  });

  it('should create component', () => {
    expect(component).toBeDefined();
  });
});
