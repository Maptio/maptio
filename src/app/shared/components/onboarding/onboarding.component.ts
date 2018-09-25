import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { isEmpty } from 'lodash';
import { environment } from '../../../../environment/environment';
import { User } from '../../model/user.data';

@Component({
    selector: 'common-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
    @Input("datasets") datasets: DataSet[];
    @Input("teams") teams: Team[];
    @Input("user") user: User;

    // REFACTOR : Urgh, use false as default you idiot!
    isZeroMaps: Boolean = true;
    isZeroTeam: Boolean = true;
    isZeroInitiative: Boolean = true;
    isZeroTeammates: Boolean = true;
    isZeroTerminology: Boolean = true;
    isZeroIntegration:Boolean=true;

    isMultipleTeams: Boolean;
    isMultipleMaps: Boolean;


    teamId: String;
    teamName: String;
    membersCount: Number;
    teamsCount: Number;
    mapsCount: Number;
    datasetId: String;
    mapName: String;
    firstCircleName: String;
    authorityName: String;
    helperName: String;

    currentStep: String;
    stepsList: String[];


    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.datasets && changes.datasets.currentValue) {
            this.datasets = changes.datasets.currentValue;
            this.isZeroMaps = isEmpty(this.datasets);
            if (!this.isZeroMaps) {
                this.datasetId = this.datasets[0].datasetId;
                this.mapName = this.datasets[0].initiative.name;

                console.log(this.datasets[0].initiative)
                this.isZeroInitiative = !this.datasets[0].initiative.children || this.datasets[0].initiative.children.length === 0;

                if (!this.isZeroInitiative) {
                    this.firstCircleName = this.datasets[0].initiative.children[0].name;
                }

                this.isMultipleMaps = this.datasets.length > 1;
                this.mapsCount = this.datasets.length;
            }
        }

        if (changes.teams && changes.teams.currentValue) {
            this.isZeroTeam = isEmpty(changes.teams.currentValue)
            if (!this.isZeroTeam) {
                this.teamId = changes.teams.currentValue[0].team_id;
                this.teamName = changes.teams.currentValue[0].name;
                this.isZeroTeammates = (<Team>changes.teams.currentValue[0]).members.length === 1;
                this.membersCount = (<Team>changes.teams.currentValue[0]).members.length;

                this.isZeroTerminology =
                    (<Team>changes.teams.currentValue[0]).settings.authority === environment.DEFAULT_AUTHORITY_TERMINOLOGY
                    && (<Team>changes.teams.currentValue[0]).settings.helper === environment.DEFAULT_HELPER_TERMINOLOGY;

                if (!this.isZeroTerminology) {
                    this.authorityName = (<Team>changes.teams.currentValue[0]).settings.authority;
                    this.helperName = (<Team>changes.teams.currentValue[0]).settings.helper;
                }

                this.isMultipleTeams = changes.teams.currentValue.length > 1;
                if (this.isMultipleTeams) {
                    this.teamsCount = changes.teams.currentValue.length
                }

                this.isZeroIntegration = !(<Team>changes.teams.currentValue[0]).slack.access_token

            }
        }
        this.cd.markForCheck();
    }

    isOnboardingCompleted() {
        return !this.isZeroMaps && !this.isZeroTeam && !this.isZeroInitiative
    }
}
