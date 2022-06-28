import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OnboardingComponent } from './onboarding.component';
import { DataSet } from '../../model/dataset.data';
import { User } from '../../model/user.data';
import { Team } from '../../model/team.data';
import { Steps } from './onboarding.enum';

@Injectable()
export class OnboardingService {
  constructor(private modalService: NgbModal) {}

  open(user: User) {
    const modal = this.modalService.open(OnboardingComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
      beforeDismiss: () => {
        document.querySelector('.modal-content').classList.add('shake');
        setTimeout(() => {
          document.querySelector('.modal-content').classList.remove('shake');
        }, 1000);
        modal.componentInstance.escape = true;
        return false;
      },
      windowClass: 'texture',
    });

    const keys = Object.keys(Steps).filter(
      (k) => typeof Steps[k as any] === 'number'
    ); // ["A", "B"]

    modal.componentInstance.user = user;
    modal.componentInstance.steps = keys;
    // modal.componentInstance.team = team;
    // modal.componentInstance.members = members;
    // modal.componentInstance.dataset = dataset;
  }
}
