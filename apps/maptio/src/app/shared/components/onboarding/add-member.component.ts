import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Team } from '../../model/team.data';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { User } from '../../model/user.data';
import { DatasetFactory } from '../../../core/http/map/dataset.factory';
import { DataSet } from '../../model/dataset.data';
import { UserFactory } from '../../../core/http/user/user.factory';
import { TeamFactory } from '../../../core/http/team/team.factory';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'onboarding-add-member',
    templateUrl: './add-member.component.html'
})
export class AddMemberComponent implements OnInit {

    form: FormGroup;
    isAdded: boolean;
    isAdding: boolean;
    errorMessage:string;

    @Input("team") team: Team;
    @Input("member") member:User;
    @Output("error") error: EventEmitter<string> = new EventEmitter<string>();
    @Output("added") added: EventEmitter<{ team: Team, user: User }> = new EventEmitter<{ team: Team, user: User }>();

    constructor(private userService: UserService,
        private datasetFactory: DatasetFactory,
        private userFactory: UserFactory, private teamFactory: TeamFactory
        , private analytics: Angulartics2Mixpanel, private intercom: Intercom,
        private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            "firstname": new FormControl("", {
                validators: [
                    Validators.required
                ],
                updateOn: 'submit'
            }),
            "lastname": new FormControl("", {
                validators: [
                    Validators.required
                ],
                updateOn: 'submit'
            }),
            "email": new FormControl("", {
                validators: [
                    Validators.required,
                    Validators.email
                ],
                updateOn: 'submit'
            })
        })

    }

    isInvalid(formControlName: string) {
        return this.form.controls[formControlName].invalid && (this.form.controls[formControlName].dirty || this.form.controls[formControlName].touched)
    }

    add() {
        if (this.form.dirty && this.form.valid) {
            this.isAdding = true;
            this.errorMessage = null;
            this.cd.markForCheck();
            let email = this.form.controls["email"].value
            let firstname = this.form.controls["firstname"].value
            let lastname = this.form.controls["lastname"].value

            return this.userService.createUserPlaceholder(email, firstname, lastname)
                .then((user: User) => {
                    return this.datasetFactory.get(this.team).then((datasets: DataSet[]) => {
                        let virtualUser = new User();
                        virtualUser.name = user.name;
                        virtualUser.email = user.email;
                        virtualUser.firstname = user.firstname;
                        virtualUser.lastname = user.lastname;
                        virtualUser.nickname = user.nickname;
                        virtualUser.user_id = user.user_id;
                        virtualUser.picture = user.picture;
                        virtualUser.teams = [this.team.team_id];
                        virtualUser.datasets = datasets.map(d => d.datasetId);

                        return virtualUser;
                    }, (reason) => {
                        return Promise.reject(`Can't create ${email} : ${reason}`);
                    })
                }, (reason: any) => {
                    throw JSON.parse(reason._body).message;
                })
                .then((virtualUser: User) => {
                    this.userFactory.create(virtualUser)
                    return virtualUser;
                })
                .then((user: User) => {
                    this.team.members.push(user);
                    return this.teamFactory.upsert(this.team).then((result) => {
                        if (result) {
                            return user
                        }
                        else {
                            throw "Error while updating team";
                        }
                    });

                })
                .then((user: User) => {
                    this.added.emit({ team: this.team, user: user });
                })
                .then(() => {
                    this.analytics.eventTrack("Team", { action: "create", team: this.team.name, teamId: this.team.team_id });
                    return true;
                })
                .then(() => {
                    this.intercom.trackEvent("Create user", { team: this.team.name, teamId: this.team.team_id, email: email });
                    return true;
                })
                .then(() => {
                    this.isAdding = false;
                    this.form.reset();
                    this.cd.markForCheck();
                })
                .catch((reason) => {
                    this.isAdding = false;
                    this.errorMessage = reason;
                    this.cd.markForCheck();
                    console.error(reason)
                    throw Error(reason);
                })
        }




    }
}
