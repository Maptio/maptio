import { environment } from '../../../../environment/environment';
import { Subscription } from "rxjs/Subscription";
import { Permissions } from "../../../shared/model/permission.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Angulartics2Mixpanel } from "angulartics2";
import { UserFactory } from "../../../shared/services/user.factory";
import { Component, OnInit, ChangeDetectorRef, TemplateRef, Renderer2 } from "@angular/core";
import { TeamFactory } from "../../../shared/services/team.factory";
import { Auth } from "../../../shared/services/auth/auth.service";
import { User } from "../../../shared/model/user.data";
import { Team } from "../../../shared/model/team.data";
import { UserService } from "../../../shared/services/user/user.service";
import { Router, ActivatedRoute } from "@angular/router";
import { IntercomService } from './intercom.service';
import { isEmpty } from 'lodash';
import { LoaderService } from '../../../shared/services/loading/loader.service';

@Component({
    selector: "team-list",
    templateUrl: "./team-list.component.html",
    styleUrls: ["./team-list-component.css"]
})

export class TeamListComponent implements OnInit {

    public user: User;
    public userSubscription: Subscription;
    public routeSubscription: Subscription;
    public teams: Array<Team>;
    public errorMessage: string;
    public cannotCreateMoreTeamMessage: string;
    public isCreating: boolean;

    public createForm: FormGroup;
    public teamName: string;
    public teamsNumber: Number;
    public isZeroTeam:Boolean;

    Permissions = Permissions;
    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

    constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef, public auth: Auth, private teamFactory: TeamFactory, private userFactory: UserFactory,
        private userService: UserService, private analytics: Angulartics2Mixpanel, public router: Router,
        private renderer: Renderer2, private intercomService: IntercomService, private loaderService:LoaderService) {

        this.createForm = new FormGroup({
            "teamName": new FormControl(this.teamName, [
                Validators.required,
                Validators.minLength(2)
            ]),
        });
    }

    public disableFieldset = (templateRef: TemplateRef<any>) => {
        this.renderer.setAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled", "");
    }
    public enableFieldset = (templateRef: TemplateRef<any>) => {
        // this.renderer.removeAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled");
    }

    ngOnInit() {
        this.loaderService.show();
        this.routeSubscription = this.route.data
            .subscribe((data: any) => {
                this.teams = data.teams;
                this.isZeroTeam = isEmpty(this.teams);
                this.teamsNumber = data.teams.length;
                this.cd.markForCheck();
                this.loaderService.hide();
            });
        this.userSubscription = this.auth.getUser().subscribe(user => {
            this.user = user;
        })
    }

    ngOnDestroy(): void {
        if (this.userSubscription) this.userSubscription.unsubscribe();
        if (this.routeSubscription) this.routeSubscription.unsubscribe();
    }

    canCreateUnlimitedTeams(){
        return this.auth.getPermissions().includes(Permissions.canCreateUnlimitedTeams);
    }


    createNewTeam() {
        if (this.teamsNumber >= 1) {
            this.cannotCreateMoreTeamMessage = "You have reached your maximum number of teams allowed: 1. Please reach out at support@maptio.com if you need to change these settings."

        } else {
            if (this.createForm.dirty && this.createForm.valid) {
                let teamName = this.createForm.controls["teamName"].value;
                this.isCreating = true;
                this.teamFactory.create(new Team({ name: teamName, members: [this.user] }))
                    .then((team: Team) => {
                        this.user.teams.push(team.team_id);
                        return this.userFactory.upsert(this.user)
                            .then((result: boolean) => {
                                if (result) {
                                    this.teamName = ""
                                    this.analytics.eventTrack("Create team", { email: this.user.email, name: teamName, teamId: team.team_id })
                                }
                                else {
                                    throw `Unable to add you to team ${teamName}!`
                                }
                            },
                                () => { throw `Unable to create team ${teamName}!` })
                            .then(() => {
                                return team
                            })
                    },
                        () => { throw `Unable to create team ${teamName}!` })
                    .then((team: Team) => {
                        return this.intercomService.createTeam(this.user, team).toPromise().then(result => {
                            if (result)
                                return team
                            else
                                throw "Cannot sync team with Intercom."
                        })
                    })
                    .then((team: Team) => {
                        this.router.navigate(["teams", team.team_id, team.getSlug()])
                        this.isCreating = false;
                    })
                    .catch((error) => {
                        this.errorMessage = error;
                        this.teamName = ""
                        this.isCreating = false;
                        this.cd.markForCheck();
                    })

            }
        }


        // REFACTOR : this is not the right way to write then/catch


    }

    trackByMemberId(index: number, member: User) {
        return member.user_id;
    }

    trackByTeamId(index: number, team: Team) {
        return team.team_id;
    }

}