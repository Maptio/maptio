import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperAvatarComponent } from './helper-avatar.component';

describe('HelperAvatarComponent', () => {
  let component: HelperAvatarComponent;
  let fixture: ComponentFixture<HelperAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelperAvatarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelperAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
