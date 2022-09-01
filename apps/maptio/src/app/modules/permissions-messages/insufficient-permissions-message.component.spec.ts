import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsufficientPermissionsMessageComponent } from './insufficient-permissions-message.component';

describe('InsufficientPermissionsMessageComponent', () => {
  let component: InsufficientPermissionsMessageComponent;
  let fixture: ComponentFixture<InsufficientPermissionsMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsufficientPermissionsMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsufficientPermissionsMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
