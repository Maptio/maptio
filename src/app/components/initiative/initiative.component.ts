import { UserFactory } from "./../../shared/services/user.factory";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "./../../shared/services/team.factory";
import { Component, Input, ViewChild, OnChanges, SimpleChanges, OnInit, EventEmitter, Output } from "@angular/core";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import { Initiative } from "../../shared/model/initiative.data"
import { Team } from "../../shared/model/team.data"
import "rxjs/add/operator/map";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../shared/model/user.data";
import { _catch } from "rxjs/operator/catch";
import { _do } from "rxjs/operator/do";
import { switchMap } from "rxjs/operator/switchMap";
import { of } from "rxjs/observable/of";
import { map } from "rxjs/operator/map";
import { debounceTime } from "rxjs/operator/debounceTime";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";


@Component({
    selector: "initiative",
    template: require("./initiative.component.html"),
    styleUrls: ["./initiative.component.css"],
    // providers: [Initiative]
})

export class InitiativeComponent implements OnChanges {

    @Output() edited: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() node: Initiative;
    @Input() parent: Initiative;
    @Input() isReadOnly: boolean;

    public team: Promise<Team>;
    public members: Promise<User[]>;

    // public possibleHelpers: Promise<User[]>;

    isTeamMemberFound: boolean = true;
    isTeamMemberAdded: boolean = false;
    currentTeamName: string;
    searching: boolean;
    searchFailed: boolean;

    constructor(private teamFactory: TeamFactory, private userFactory: UserFactory) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.node.currentValue) {
            this.team = this.teamFactory.get(changes.node.currentValue.team_id).then((team: Team) => {
                this.members = Promise.all(team.members.map(u => this.userFactory.get(u.user_id)));
                return team;
            })
            // this.possibleHelpers = this.team.then((team: Team) => {
            //     return team.members.map((user: User) => {
            //         if (user.user_id !== this.node.accountable.user_id) {
            //             return user;
            //         }
            //     )
            // })
        }

    }

    onBlur() {
        this.edited.emit(true);
    }

    saveName(newName: any) {
        this.node.name = newName;
    }

    saveDescription(newDesc: string) {
        this.node.description = newDesc;
    }

    saveStartDate(newDate: string) {
        let year = Number.parseInt(newDate.substr(0, 4));
        let month = Number.parseInt(newDate.substr(5, 2));
        let day = Number.parseInt(newDate.substr(8, 2));
        let parsedDate = new Date(year, month, day);

        // HACK : this should not be here but in a custom validatpr. Or maybe use HTML 5 "pattern" to prevent binding
        if (!Number.isNaN(parsedDate.valueOf())) {
            this.node.start = new Date(year, month, day);
        }
    }

    saveAccountable(newAccountable: NgbTypeaheadSelectItemEvent) {
        // console.log("asving", newAccountable.item)
        this.node.accountable = newAccountable.item;
        this.onBlur();
        // console.log(this.initiative.accountable)
    }

    isHelper(user: User): boolean {
        if (!this.node) return false;
        if (!this.node.helpers) return false;
        if (!user.user_id) return false;
        return this.node.helpers.findIndex(u => { return u.user_id === user.user_id }) !== -1
    }

    // getPossibleHelpers(): Promise<User[]> {
    //     return this.team.then((team: Team) => {
    //         return team.members;
    //     })
    // }

    isAuthority(user: User): boolean {
        if (!this.node) return false;
        if (!this.node.helpers) return false;
        if (!this.node.accountable) return false;
        if (!user) return false;
        if (!user.user_id) return false;
        return this.node.accountable.user_id === user.user_id;
    }

    addHelper(newHelper: User, checked: boolean) {
        if (checked) {
            this.node.helpers.push(newHelper);
        }
        else {
            let index = this.node.helpers.findIndex(user => user.user_id === newHelper.user_id);
            this.node.helpers.splice(index, 1);
        }
    }

    filterMembers(term: string): Observable<User[]> {
        // return term.length < 1
        //     ? Observable.from(this.team.then(t => t.members).catch())
        //     : Observable.from(this.team.then(t => t.members.filter(v => new RegExp(term, "gi").test(v.name)).splice(0, 10)).catch())
        return term.length < 1
            ? Observable.from(this.members)
            : Observable.from(this.members.then(members => members.filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email)).splice(0, 10)).catch())

    }

    removeAuthority() {
        this.node.accountable = undefined;
    }

    searchTeamMember = (text$: Observable<string>) =>
        _do.call(
            switchMap.call(
                _do.call(
                    distinctUntilChanged.call(
                        debounceTime.call(text$, 300)),
                    () => this.searching = true),
                (term: string) =>
                    _catch.call(
                        _do.call(
                            this.filterMembers(term)
                            , () => this.searchFailed = false),
                        () => {
                            this.searchFailed = true;
                            return of.call([]);
                        }
                    )
            ),
            () => this.searching = false);


    formatter = (result: User) => { return result.nickname } ;
}




