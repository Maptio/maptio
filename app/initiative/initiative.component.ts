import { Component, Injectable, Inject, AfterViewInit, OnInit, Input, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { InitiativeNode } from '../model/initiative.data'
import { Team } from '../model/team.data'
import { Person } from '../model/person.data'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';



@Component({
    selector: 'initiative',
    templateUrl: './initiative.component.html',
    providers: [InitiativeNode]
})

export class InitiativeComponent {

    @ViewChild('initiativeModal')
    modal: ModalComponent;

    @Input() data: InitiativeNode;
    @Input() team: Team;

    isTeamMemberFound: boolean= true;
    currentTeamName:string;


    constructor() {
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

    saveNodeAccountable(newAccountable: Person) {
        this.data.accountable = newAccountable;
    }

    searchTeamMember =
    (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => {
                try{
                    this.currentTeamName = term;
                    let results = term.length < 1 ? this.team.members : this.team.members.filter(v => new RegExp(term, 'gi').test(v.name)).splice(0, 10);
                    this.isTeamMemberFound = (results != undefined && results.length != 0) ? true : false;
                    return results;
                }
                catch(Exception){
                    this.isTeamMemberFound = false;
                }
            });

    formatter = (result: Person) => result.name;

    addTeamMember(){
        this.team.members.push({name:this.currentTeamName}); 
    }

    // saveNodeSize(newSize: number) {
    //     this.data.size = newSize;
    // }

    open() {
        this.modal.open();
    }

}




