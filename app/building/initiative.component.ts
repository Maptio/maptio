import { Component, Injectable, Inject} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {InitiativeNode} from './initiative.data'



@Component({
    selector: 'initiative',
    template:
    `
        <modal-header [show-close]="false">
        <h4 class="modal-title">I'm a modal!</h4>
        </modal-header>
        <modal-body>
        {{initiative.name}}
        </modal-body>
        <modal-footer [show-default-buttons]="true"></modal-footer> 
    `,
    providers:[InitiativeNode]
})

export class InitiativeComponent{


    constructor(public initiative:InitiativeNode){
        console.log("INITIATIVE COMPOENNTE : " + this.initiative.name);
    }
}




