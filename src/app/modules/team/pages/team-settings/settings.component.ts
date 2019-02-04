import { environment } from '../../../../config/environment';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Permissions } from "../../../../shared/model/permission.data";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, Input, ChangeDetectorRef, TemplateRef, Renderer2, Output, EventEmitter, isDevMode } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Team } from "../../../../shared/model/team.data";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { Intercom } from 'ng-intercom';

@Component({
    selector: "team-single-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class TeamSettingsComponent implements OnInit {

    @Input() team: Team;
    @Output("changeName") changeName: EventEmitter<string> = new EventEmitter<string>();

    public teamSettingsForm: FormGroup;
    public teamName: string;
    public teamAuthority: string;
    public teamHelper: string;
    public isTeamSettingSaved: boolean;
    public isTeamSettingFailed: boolean;

    Permissions = Permissions;
    CanEditTeam = Permissions.canEditTeam;

    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
    constructor(private cd: ChangeDetectorRef, private teamFactory: TeamFactory, private router: Router,
        private route: ActivatedRoute, private renderer: Renderer2, private intercom: Intercom) {
        this.teamSettingsForm = new FormGroup({
            "name": new FormControl(this.teamName, {
                validators: [
                    Validators.required,
                    Validators.minLength(2)
                ],
                updateOn: "submit"
            }),
            "authority": new FormControl(this.teamAuthority, {
                validators: [],
                updateOn: "submit"
            }),
            "helper": new FormControl(this.teamHelper, {
                validators: [],
                updateOn: "submit"
            }),
        });
    }

    public disableFieldset = (templateRef: TemplateRef<any>) => {
        this.renderer.setAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled", "");
    }
    public enableFieldset = (templateRef: TemplateRef<any>) => {
        // this.renderer.removeAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled");
    }

    ngOnInit() {

        this.route.parent.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                this.team = data.assets.team;
                this.teamName = this.team.name;
                this.teamAuthority = this.team.settings.authority;
                this.teamHelper = this.team.settings.helper;
            });

    }


    saveTeamSettings() {
        this.isTeamSettingSaved = false;
        this.isTeamSettingFailed = false;
        if (this.teamSettingsForm.valid && this.teamSettingsForm.dirty) {
            let updatedTeam = new Team({
                team_id: this.team.team_id,
                name: this.teamSettingsForm.controls["name"].value,
                members: this.team.members,
                isExample: this.team.isExample,
                isTemporary : this.team.isTemporary,
                settings: {
                    authority: this.teamSettingsForm.controls["authority"].value,
                    helper: this.teamSettingsForm.controls["helper"].value
                }
            });

            this.teamFactory.upsert(updatedTeam)
                .then((isUpdated: boolean) => {
                    this.isTeamSettingSaved = isUpdated;
                    this.intercom.trackEvent("Change terminology", { team: this.team.name, teamId: this.team.team_id, authority: updatedTeam.settings.authority, helper: updatedTeam.settings.helper });

                    this.cd.markForCheck();
                })
                .then(() => {
                    this.router.navigate(["teams", this.team.team_id, this.team.getSlug(), "settings"], { queryParams: { reload: true } })
                })
                .catch(err => {
                    if(!isDevMode) console.error(err);
                    this.isTeamSettingFailed = true;
                    this.cd.markForCheck();
                })
        }
    }
}