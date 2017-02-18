import { Component, Input, ViewChild } from "@angular/core";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import { Initiative } from "../../shared/model/initiative.data"
import { Team } from "../../shared/model/team.data"
import { Person } from "../../shared/model/person.data"
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";



@Component({
    selector: "initiative",
    template: require("./initiative.component.html"),
    providers: [Initiative]
})

export class InitiativeComponent {

    @ViewChild("initiativeModal")
    modal: ModalComponent;

    @Input() data: Initiative;
    @Input() team: Team;

    isTeamMemberFound: boolean = true;
    isTeamMemberAdded: boolean = false;
    currentTeamName: string;


    constructor() {
    }

    open() {
        this.modal.open();
    }

    saveNodeName(newName: any) {
        this.data.name = newName;
    }

    saveNodeDescription(newDesc: string) {
        this.data.description = newDesc;
    }

    saveNodeStartDate(newDate: string) {
        let year = Number.parseInt(newDate.substr(0, 4));
        let month = Number.parseInt(newDate.substr(5, 2));
        let day = Number.parseInt(newDate.substr(8, 2));
        let parsedDate = new Date(year, month, day);

        // HACK : this should not be here but in a custom validatpr. Or maybe use HTML 5 "pattern" to prevent binding
        if (!Number.isNaN(parsedDate.valueOf())) {
            this.data.start = new Date(year, month, day);
        }
    }

    saveNodeAccountable(newAccountable: string) {
        this.data.accountable = <Person>JSON.parse(newAccountable);
    }



    searchTeamMember =
    (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => {
                try {
                    this.isTeamMemberAdded = false;
                    this.currentTeamName = term;
                    let results = term.length < 1 ? this.team.members : this.team.members.filter(v => new RegExp(term, "gi").test(v.name)).splice(0, 10);
                    this.isTeamMemberFound = (results != undefined && results.length != 0) ? true : false;
                    return results;
                }
                catch (Exception) {
                    this.isTeamMemberFound = false;
                }
            });

    formatter = (result: Person) => result.name;

    addTeamMember() {
        try {
            let newPerson = new Person();
            newPerson.name = this.currentTeamName;
            this.team.members.push(new Person());
            this.isTeamMemberAdded = true;

        }
        catch (Exception) {
            this.isTeamMemberAdded = false;
        }

    }
}




