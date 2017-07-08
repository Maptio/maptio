
import { TeamFactory } from "./../../shared/services/team.factory";
import { Component, Input, ViewChild, OnChanges, SimpleChanges, OnInit } from "@angular/core";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import { Initiative } from "../../shared/model/initiative.data"
import { Team } from "../../shared/model/team.data"
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../shared/model/user.data";



@Component({
    selector: "initiative",
    template: require("./initiative.component.html"),
    // styles: [require("./initiative.component.css").toString()],
    // providers: [Initiative]
})

export class InitiativeComponent implements OnInit {


    // @ViewChild("initiativeModal")
    // modal: ModalComponent;

    @Input() initiative: Initiative;
    @Input() parent: Initiative;
    // @Input() team: Team;

    public team: Promise<Team>;

    isTeamMemberFound: boolean = true;
    isTeamMemberAdded: boolean = false;
    currentTeamName: string;


    constructor(private teamFactory: TeamFactory) {

    }

    ngOnInit() {
        if (!this.initiative) return;
        if (!this.initiative.team_id) return;
        this.team = this.teamFactory.get(this.initiative.team_id)
    }

    saveName(newName: any) {
        this.initiative.name = newName;
    }

    saveDescription(newDesc: string) {
        this.initiative.description = newDesc;
    }

    saveStartDate(newDate: string) {
        let year = Number.parseInt(newDate.substr(0, 4));
        let month = Number.parseInt(newDate.substr(5, 2));
        let day = Number.parseInt(newDate.substr(8, 2));
        let parsedDate = new Date(year, month, day);

        // HACK : this should not be here but in a custom validatpr. Or maybe use HTML 5 "pattern" to prevent binding
        if (!Number.isNaN(parsedDate.valueOf())) {
            this.initiative.start = new Date(year, month, day);
        }
    }

    saveAccountable(newAccountable: NgbTypeaheadSelectItemEvent) {
        this.initiative.accountable = newAccountable.item;
        // console.log(this.initiative.accountable)
    }

    isHelper(user: User): boolean {
        if (!this.initiative) return false;
        if (!this.initiative.helpers) return false;
        if (!user.user_id) return false;
        return this.initiative.helpers.findIndex(u => { return u.user_id === user.user_id }) !== -1
    }

    isAuthority(user: User): boolean {
        if (!this.initiative) return false;
        if (!this.initiative.helpers) return false;
        if (!this.initiative.accountable) return false;
        if (!user) return false;
        if (!user.user_id) return false;
        return this.initiative.accountable.user_id === user.user_id;
    }

    addHelper(newHelper: User, checked: boolean) {
        if (checked) {
            this.initiative.helpers.push(newHelper);
        }
        else {
            let index = this.initiative.helpers.findIndex(user => user.user_id === newHelper.user_id);
            this.initiative.helpers.splice(index, 1);
        }
    }


    searchTeamMember(team: Team) {
       
        return (text$: Observable<string>) =>
            text$
                .debounceTime(200)
                .distinctUntilChanged()
                .map(term => {
                    try {
                        if(!team) return [];
                        
                        this.isTeamMemberAdded = false;
                        this.currentTeamName = term;
                        let results = term.length < 1 ? team.members : team.members.filter(v => new RegExp(term, "gi").test(v.name)).splice(0, 10);
                        this.isTeamMemberFound = (results !== undefined && results.length !== 0) ? true : false;
                        return results;
                    }
                    catch (Exception) {
                        this.isTeamMemberFound = false;
                    }
                });
    }


    formatter = (result: User) => result.name;
}




