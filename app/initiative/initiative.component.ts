import { Component, Injectable, Inject, AfterViewInit, OnInit, Input, ViewChild} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {InitiativeNode} from '../model/initiative.data'
import {Person} from '../model/person.data'



@Component({
    selector: 'initiative',
    templateUrl:'./initiative.component.html',
    providers:[InitiativeNode]
})

export class InitiativeComponent {

    @ViewChild('initiativeModal')
    modal:ModalComponent;

    @Input() data: InitiativeNode;
    @Input() team: Array<Person>;


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

    saveNodeAccountable(newAccountable:Person){
        this.data.accountable = newAccountable;
    }

    // saveNodeSize(newSize: number) {
    //     this.data.size = newSize;
    // }

    open(){
        this.modal.open();
    }

}




