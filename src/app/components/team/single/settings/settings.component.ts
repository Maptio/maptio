import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Team } from "../../../../shared/model/team.data";
import { TeamFactory } from "../../../../shared/services/team.factory";

@Component({
    selector: "team-single-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"]
})
export class TeamSettingsComponent implements OnInit {

    @Input() team: Team;

    public teamSettingsForm: FormGroup;
    public teamName: string;
    public teamAuthority: string;
    public teamHelper: string;
    public isTeamSettingSaved: boolean;
    public isTeamSettingFailed: boolean;

    constructor(private cd: ChangeDetectorRef, private teamFactory: TeamFactory) {
        this.teamSettingsForm = new FormGroup({
            "name": new FormControl(this.teamName, [
                Validators.required,
                Validators.minLength(2)
            ]),
            "authority": new FormControl(this.teamAuthority),
            "helper": new FormControl(this.teamHelper),
        });
    }

    ngOnInit() {

        this.teamName = this.team.name;
        this.teamAuthority = this.team.settings.authority;
        this.teamHelper = this.team.settings.helper;
    }


    saveTeamSettings() {
        this.isTeamSettingSaved = false;
        this.isTeamSettingFailed = false;
        if (this.teamSettingsForm.valid && this.teamSettingsForm.dirty) {
            let updatedTeam = new Team({
                team_id: this.team.team_id,
                name: this.teamName,
                members: this.team.members,
                settings: { authority: this.teamAuthority, helper: this.teamHelper }
            });

            this.teamFactory.upsert(updatedTeam)
                .then((isUpdated: boolean) => {
                    this.isTeamSettingSaved = isUpdated;
                    this.cd.markForCheck();
                })
                .catch(err => { this.isTeamSettingFailed = true; this.cd.markForCheck(); })
        }
    }
}