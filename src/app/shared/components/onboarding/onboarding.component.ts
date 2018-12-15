import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { isEmpty } from 'lodash';
import { environment } from '../../../../environment/environment';
import { User } from '../../model/user.data';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamService } from '../../services/team/team.service';
import { Router } from '@angular/router';
import { MapService } from '../../services/map/map.service';
import { Steps } from './onboarding.enum';



@Component({
    selector: 'common-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {

    currentStep: string;
    currentIndex: number = 0;
    nextActionName: string = "Start";
    previousActionName: string = null;
    progress: string;
    progressLabel: string;

    @ViewChild("inputTeamName") inputTeamName:ElementRef;


    teamCreationErrorMessage: string;
    isTerminologySaved: boolean;
    teamName: string ="";
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
    @Input("steps") steps: string[];
    // @Input("members") members: User[];
    // @Input("team") team: Team;
    // @Input("dataset") dataset: DataSet;
    // @Input("isCompleted") isCompleted: boolean;
    // @Input("escape") escape: boolean;


    constructor(public activeModal: NgbActiveModal, private cd: ChangeDetectorRef,
        private teamService: TeamService, private mapService: MapService, private router: Router) { }

    ngOnInit(): void {
        this.currentStep = this.steps[this.currentIndex];
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes)
    }

    close() {
        this.activeModal.dismiss();
    }

    nextStep() {
        if (this.currentIndex === this.steps.length - 1) {
            // if (this.user.teams.length === 0) {
            //     return this.getDemoMap(this.user)
            //         .then((dataset: DataSet) => {
            //             this.isRedirecting = true;
            //             this.cd.markForCheck();
            //             return this.router.navigateByUrl(`/map/${dataset.datasetId}/${dataset.initiative.getSlug()}`);
            //         })
            //         .then(() => {
            //             this.isRedirecting = false;
            //             this.cd.markForCheck();
            //             this.activeModal.close();
            //         })
            // }
            // else {
            //     this.close();
            // }

        }

        if(this.currentStep === "CreateTeam"){
            if(isEmpty(this.inputTeamName.nativeElement.value)){
                this.teamCreationErrorMessage = "A org name is required."
                this.cd.markForCheck();
                return ;
            }
            else{
                this.teamName = this.inputTeamName.nativeElement.value;
                this.cd.markForCheck();
            }
        }

        this.currentIndex += 1;
        this.currentStep = this.steps[this.currentIndex]
        this.nextActionName = this.getNextActionName();
        this.previousActionName = this.getPreviousActionName();
        this.progress = Number(Math.ceil((this.currentIndex + 1) / this.steps.length * 100)).toFixed(0);
        this.progressLabel = `${this.steps.length - (this.currentIndex + 1)} steps left`
        this.cd.markForCheck();
    }

    previousStep() {
        this.currentIndex -= 1;
        this.currentStep = this.steps[this.currentIndex]
        this.nextActionName = this.getNextActionName();
        this.previousActionName = this.getPreviousActionName();
        this.cd.markForCheck();
    }


    // nextStep() {
    //     if (this.currentStep === Steps.Ending) {
    //         this.router.navigate(
    //             ["map", this.dataset.datasetId, this.dataset.initiative.getSlug(), "circles"],
    //             { queryParams: { reload: true, color: this.selectedColor } })
    //         this.activeModal.close();
    //     }
    //     this.currentStep += 1;
    //     this.cd.markForCheck();

    // }

    getProgress() {
        return Number(Math.ceil((this.currentIndex + 1) / this.steps.length * 100)).toFixed(0)
    }

    getAbsoluteProgress() {
        return `${this.steps.length - (this.currentIndex + 1)} steps left`;
    }

    // isReady() {
    //     switch (this.currentStep) {
    //         case "CreateTeam":
    //             return false;
    //         case "AddMember":
    //             return this.members.length > 1;
    //         case "Terminology":
    //             return this.isTerminologySaved;
    //         default:
    //             return true;
    //     }
    // }

    getNextActionName() {
        switch (this.currentStep) {
            case "Welcome":
                return "Start";
            default:
                return "Next";
        }
    }

    getPreviousActionName() {
        return this.currentStep === "Welcome" ? null : "Back";
    }

    // isSkippable() {
    //     switch (this.currentStep) {
    //         case Steps.AddMember:
    //             return true;
    //         case Steps.Terminology:
    //             return true;
    //         case Steps.PickColor:
    //             return true;
    //         default:
    //             return false;
    //     }
    // }

    saveTeamName(name:string){
        this.teamName = name; 
    }

    // renameTeam(name: string) {
    //     this.teamService.renameTemporary(this.team, name)
    //         .then(result => {
    //             if (result) {
    //                 this.teamName = name;
    //                 this.nextStep();
    //             } else {
    //                 throw "Error while creating an organization"
    //             }
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             this.teamCreationErrorMessage = err;
    //             this.cd.markForCheck();
    //         })
    // }

    // onAdded(event: { team: Team, user: User }) {
    //     this.members.push(event.user);
    //     this.cd.markForCheck();
    // }

    // getMemberIndexes() {
    //     return Array.from({ length: this.MAX_MEMBERS - this.members.length }, (x, i) => i + 1);
    // }

    // selectColor(color: { name: string, isSelected: boolean }) {
    //     this.COLORS.forEach(c => c.isSelected = false);
    //     color.isSelected = true;
    //     this.selectedColor = color.name;
    //     let settings: any = JSON.parse(localStorage.getItem(`map_settings_${this.dataset.datasetId}`));
    //     settings.mapColor = color.name;
    //     localStorage.setItem(`map_settings_${this.dataset.datasetId}`, JSON.stringify(settings));
    //     this.cd.markForCheck();
    // }
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
