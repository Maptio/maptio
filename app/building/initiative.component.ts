import { Component, Injectable, Inject, AfterViewInit, OnInit, Input} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {InitiativeNode} from './initiative.data'



@Component({
    selector: 'initiative',
    
    template:
    `
        <modal-header [show-close]="false">
        <h4 class="modal-title">{{initiative?.name}}</h4>
        </modal-header>
        <modal-body>
            <input class="form-control input-sm name" type="text"  [ngModel]="initiative?.name" placeholder="Initiative name">
            <input class="form-control input-sm size" type="text" [ngModel]="initiative?.size" placeholder="Team Size">
            <textarea class="form-control description" rows="3" [ngModel]="initiative?.description" placeholder="Description"></textarea>
               
        </modal-body>
        <modal-footer [show-default-buttons]="true"></modal-footer> 
    `,
    providers:[InitiativeNode]
})

export class InitiativeComponent {

    @Input() initiative: InitiativeNode;

    constructor(){
    }

}




