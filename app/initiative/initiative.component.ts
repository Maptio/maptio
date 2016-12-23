import { Component, Injectable, Inject, AfterViewInit, OnInit, Input, ViewChild} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {InitiativeNode} from '../model/initiative.data'



@Component({
    selector: 'initiative',
    templateUrl:'./initiative.component.html',
    providers:[InitiativeNode]
})

export class InitiativeComponent {

    @ViewChild('initiativeModal')
    modal:ModalComponent;

    @Input() data: InitiativeNode;

    constructor(){
    }

    saveNodeName(newName: any) {
        this.data.name = newName;
    }

    saveNodeDescription(newDesc: string) {
        this.data.description = newDesc;
    }

    saveNodeStartDate(newDate: Date) {
        this.data.start = newDate;
    }

    // saveNodeSize(newSize: number) {
    //     this.data.size = newSize;
    // }

    open(){
        this.modal.open();
    }

}




