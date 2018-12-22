import { Injectable } from '@angular/core';
import { User } from '../../model/user.data';
import { NgbModal } from '../../../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { InstructionsComponent } from './instructions.component';
import { Steps } from './instructions.enum';

@Injectable()
export class InstructionsService {

    constructor(private modalService: NgbModal) { }

    openWelcome(user: User) {
        this.open(user, false, true)
    }

    openTutorial(user: User) {
        this.open(user, false, true)
    }

    private open(user: User, isDismissable: boolean, isWelcomeSequence: boolean) {
        let modalInstructionsRef = this.modalService.open(InstructionsComponent,
            {
                size: 'lg',
                backdrop: isDismissable ? true : 'static',
                centered: true,
                beforeDismiss: () => {
                    if (isDismissable) {
                        return true
                    }
                    else {
                        document.querySelector(".modal-content").classList.add("shake");
                        setTimeout(() => {
                            document.querySelector(".modal-content").classList.remove("shake")
                        }, 1000)
                        modalInstructionsRef.componentInstance.escape = true;
                        return false
                    }

                }
            })

        let keys = Object.keys(Steps).filter(k => typeof Steps[k as any] === "number"); // ["A", "B"]

        modalInstructionsRef.componentInstance.user = user;
        modalInstructionsRef.componentInstance.steps = isWelcomeSequence ? keys : keys.slice(0, keys.length - 1)
    }
}