import { Component, Injectable, Inject, AfterViewInit, OnInit, Input} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {InitiativeNode} from './initiative.data'



@Component({
    selector: 'initiative',
    templateUrl:'./initiative.component.html',
    providers:[InitiativeNode]
})

export class InitiativeComponent {

    @Input() initiative: InitiativeNode;

    constructor(){
    }

    saveNodeName(newName: any) {
        this.initiative.name = newName;
    }

    saveNodeDescription(newDesc: string) {
        this.initiative.description = newDesc;
    }

    saveNodeSize(newSize: number) {
        this.initiative.size = newSize;
    }

}




