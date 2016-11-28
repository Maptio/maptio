import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    selector: 'help',
    templateUrl: 'help.component.html'
})
export class HelpComponent {

    @ViewChild('helpModal')
    modal: ModalComponent;

    constructor() { }

    open(){
        this.modal.open();
    }
}