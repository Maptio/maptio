import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { isEmpty } from 'lodash';
import { environment } from '../../../../environment/environment';
import { User } from '../../model/user.data';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamService } from '../../services/team/team.service';
import { Router } from '@angular/router';
import { MapService } from '../../services/map/map.service';

enum Steps {
    Welcome,
    CreateTeam,
    AddMember,
    Terminology,
    PickColor,
    Ending
}

@Component({
    selector: 'common-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {

    Steps = Steps;
    currentStep: Steps = Steps.Welcome;
    teamCreationErrorMessage: string;
    isTerminologySaved: boolean;
    teamName: string;
    MAX_MEMBERS: number = 4;
    COLORS: any[] = [
        { name: "#aaa", isSelected: false },
        { name: "blue", isSelected: false },
        { name: "purple", isSelected: false },
        { name: "brown", isSelected: false },
        { name: "red", isSelected: false },
        { name: "orange", isSelected: false }
    ]
    selectedColor: string = this.COLORS[0].name;


    @Input("user") user: User;
    @Input("members") members: User[];
    @Input("team") team: Team;
    @Input("dataset") dataset: DataSet;
    @Input("isCompleted") isCompleted: boolean;
    @Input("escape") escape: boolean;


    constructor(public activeModal: NgbActiveModal, private cd: ChangeDetectorRef,
        private teamService: TeamService, private mapService: MapService, private router: Router) { }

    ngOnInit() {

    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes)
    }


    nextStep() {
        // if (this.currentStep === Steps.AddMember) {
        //     // assign random roles to random members
        //     this.mapService.randomize(this.dataset, this.members)
        //         .then(dataset => {
        //             this.dataset = dataset;
        //         })
        // }

        if (this.currentStep === Steps.Ending) {
            this.router.navigate(
                ["map", this.dataset.datasetId, this.dataset.initiative.getSlug(), "circles"],
                { queryParams: { reload: true, color: this.selectedColor } })
            this.activeModal.close();
        }
        this.currentStep += 1;
        this.cd.markForCheck();

    }

    getProgress() {
        return Number(Math.ceil((this.currentStep + 1) / 6 * 100)).toFixed(0)
    }

    getAbsoluteProgress() {
        return `${6 - (this.currentStep + 1)} steps left`;
    }

    isReady() {
        switch (this.currentStep) {
            case Steps.CreateTeam:
                return false;
            case Steps.AddMember:
                return this.members.length > 1;
            case Steps.Terminology:
                return this.isTerminologySaved;
            default:
                return true;
        }
    }

    nextActionName() {
        switch (this.currentStep) {
            case Steps.Welcome:
                return "Start";
            case Steps.CreateTeam:
                return null;
            case Steps.AddMember:
                return "Next";
            case Steps.Terminology:
                return "Next";
            case Steps.Ending:
                return "Start mapping"
            default:
                return "Next";
        }
    }

    isSkippable() {
        switch (this.currentStep) {
            case Steps.AddMember:
                return true;
            case Steps.Terminology:
                return true;
            case Steps.PickColor:
                return true;
            default:
                return false;
        }
    }

    renameTeam(name: string) {
        this.teamService.renameTemporary(this.team, name)
            .then(result => {
                if (result) {
                    this.teamName = name;
                    this.nextStep();
                } else {
                    throw "Error while creating an organization"
                }
            })
            .catch(err => {
                console.error(err);
                this.teamCreationErrorMessage = err;
                this.cd.markForCheck();
            })
    }

    onAdded(event: { team: Team, user: User }) {
        this.members.push(event.user);
        this.cd.markForCheck();
    }

    getMemberIndexes() {
        return Array.from({ length: this.MAX_MEMBERS - this.members.length }, (x, i) => i + 1);
    }

    selectColor(color: { name: string, isSelected: boolean }) {
        this.COLORS.forEach(c => c.isSelected = false);
        color.isSelected = true;
        this.selectedColor = color.name;
        let settings: any = JSON.parse(localStorage.getItem(`map_settings_${this.dataset.datasetId}`));
        settings.mapColor = color.name;
        localStorage.setItem(`map_settings_${this.dataset.datasetId}`, JSON.stringify(settings));
        this.cd.markForCheck();
    }
}

// export class OnboardingComponent implements OnInit {
//     @Input("datasets") datasets: DataSet[];
//     @Input("teams") teams: Team[];
//     @Input("user") user: User;

//     // REFACTOR : Urgh, use false as default you idiot!
//     isZeroMaps: Boolean = true;
//     isZeroTeam: Boolean = true;
//     isZeroTeammates: Boolean = true;
//     isZeroTerminology: Boolean = true;
//     isZeroIntegration:Boolean=true;

//     isMultipleTeams: Boolean;
//     isMultipleMaps: Boolean;


//     teamId: String;
//     teamName: String;
//     membersCount: Number;
//     teamsCount: Number;
//     mapsCount: Number;
//     datasetId: String;
//     mapName: String;
//     firstCircleName: String;
//     authorityName: String;
//     helperName: String;

//     currentStep: String;
//     stepsList: String[];

//     SURVEY_URL:string = environment.SURVEY_URL;


//     constructor(private cd: ChangeDetectorRef) { }

//     ngOnInit(): void {

//     }

//     ngOnChanges(changes: SimpleChanges): void {
//         if (changes.datasets && changes.datasets.currentValue) {
//             this.datasets = changes.datasets.currentValue;
//             this.isZeroMaps = isEmpty(this.datasets);
//             if (!this.isZeroMaps) {
//                 this.datasetId = this.datasets[0].datasetId;
//                 this.mapName = this.datasets[0].initiative.name;

//                 // this.isZeroInitiative = !this.datasets[0].initiative.children || this.datasets[0].initiative.children.length === 0;

//                 // if (!this.isZeroInitiative) {
//                 //     this.firstCircleName = this.datasets[0].initiative.children[0].name;
//                 // }

//                 this.isMultipleMaps = this.datasets.length > 1;
//                 this.mapsCount = this.datasets.length;
//             }
//         }

//         if (changes.teams && changes.teams.currentValue) {
//             this.isZeroTeam = isEmpty(changes.teams.currentValue)
//             if (!this.isZeroTeam) {
//                 this.teamId = changes.teams.currentValue[0].team_id;
//                 this.teamName = changes.teams.currentValue[0].name;
//                 this.isZeroTeammates = (<Team>changes.teams.currentValue[0]).members.length === 1;
//                 this.membersCount = (<Team>changes.teams.currentValue[0]).members.length;

//                 this.isZeroTerminology =
//                     (<Team>changes.teams.currentValue[0]).settings.authority === environment.DEFAULT_AUTHORITY_TERMINOLOGY
//                     && (<Team>changes.teams.currentValue[0]).settings.helper === environment.DEFAULT_HELPER_TERMINOLOGY;

//                 if (!this.isZeroTerminology) {
//                     this.authorityName = (<Team>changes.teams.currentValue[0]).settings.authority;
//                     this.helperName = (<Team>changes.teams.currentValue[0]).settings.helper;
//                 }

//                 this.isMultipleTeams = changes.teams.currentValue.length > 1;
//                 if (this.isMultipleTeams) {
//                     this.teamsCount = changes.teams.currentValue.length
//                 }

//                 this.isZeroIntegration = !(<Team>changes.teams.currentValue[0]).slack.access_token

//             }
//         }
//         this.cd.markForCheck();
//     }

//     isOnboardingCompleted() {
//         return !this.isZeroMaps && !this.isZeroTeam ; //&& !this.isZeroInitiative
//     }
// }
