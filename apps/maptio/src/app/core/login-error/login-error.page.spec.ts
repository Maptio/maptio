import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginErrorPage } from './login-error.page';

describe('LoginErrorPage', () => {
  let component: LoginErrorPage;
  let fixture: ComponentFixture<LoginErrorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginErrorPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginErrorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
