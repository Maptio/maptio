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
import { tickStep } from '../../../../../node_modules/@types/d3-array';



@Component({
    selector: 'common-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {


    @Input("user") user: User;
    @Input("steps") steps: string[];

    currentStep: string;
    currentIndex: number = 0;
    nextActionName: string = "Start";
    previousActionName: string = null;
    progress: string;
    progressLabel: string;
    isClosable: boolean = true;
    isSkippable: boolean;

    teamCreationErrorMessage: string;
    mapCreationErrorMessage: string;
    isTerminologySaved: boolean;
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
    mapName: string;
    isCreatingEmptyMap: boolean =true;
    isCreatingTeam: boolean;

    members: User[];
    team: Team;
    dataset: DataSet;

    constructor(public activeModal: NgbActiveModal, private cd: ChangeDetectorRef,
        private teamService: TeamService, private mapService: MapService, private router: Router) { }

    ngOnInit(): void {
        this.currentStep = this.steps[this.currentIndex];
        this.members = [this.user];
        this.progress = this.getProgress()
        this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`

        this.teamService.get(this.user)
            .then((teams: Team[]) => {
                let nonExampleTeams = teams.filter(t => !t.isExample);
                if (nonExampleTeams.length === 1) {
                    this.team = nonExampleTeams[0];
                } else {
                    this.team = new Team({ name: '' });
                }
            })
    }

    close() {
        this.activeModal.dismiss();
    }

    nextStep() {

        if (this.currentStep === "CreateTeam") {
            this.isCreatingTeam = false;
            this.cd.markForCheck();
            if (isEmpty(this.team.name)) {
                this.teamCreationErrorMessage = "We need a name to continue."
                this.cd.markForCheck();
                return;
            }
            else {
                this.isCreatingTeam = true;
                this.cd.markForCheck();
                this.saveTeam(this.team)
                    .then(team => {
                        this.isCreatingTeam = false;
                        this.team = team;
                        this.teamCreationErrorMessage = null;
                        this.goToNextStep();
                        this.cd.markForCheck();
                    })
            }
        }
        else if (this.currentStep === "CreateMap") {
            if (isEmpty(this.mapName)) {
                this.mapCreationErrorMessage = "We need a map name to continue.";
                this.cd.markForCheck();
                return;
            }
            else {
                this.saveMap()
                    .then(dataset => {
                        this.dataset = dataset;
                        this.mapCreationErrorMessage = null;
                        this.goToNextStep();
                        this.cd.markForCheck();
                    })
            }
        }
        else if (this.currentStep === "Ending") {
            return this.router.navigateByUrl(`/map/${this.dataset.datasetId}/${this.dataset.initiative.getSlug()}`)
                .then(() => {
                    this.cd.markForCheck();
                    this.activeModal.close();
                })

        }
        else {
            this.goToNextStep();
        }


    }

    private goToNextStep() {
        this.currentIndex += 1;
        this.currentStep = this.steps[this.currentIndex]
        this.nextActionName = this.getNextActionName();
        this.previousActionName = this.getPreviousActionName();
        this.isClosable = this.getIsClosable();
        this.isSkippable = this.getIsSkippable();
        this.progress = this.getProgress()
        this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`
        this.cd.markForCheck();
    }

    previousStep() {
        this.currentIndex -= 1;
        this.currentStep = this.steps[this.currentIndex]
        this.nextActionName = this.getNextActionName();
        this.previousActionName = this.getPreviousActionName();
        this.isClosable = this.getIsClosable();
        this.isSkippable = this.getIsSkippable();
        this.progress = this.getProgress()
        this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`

        this.cd.markForCheck();
    }

    saveTeam(team: Team): Promise<Team> {
        return this.teamService.exist(team)
            .then((exist: boolean) => {
                if (exist) {
                    return this.teamService.save(team)
                } else {
                    return this.teamService.create(team.name, this.user, [this.user], false, false)
                }
            })
    }

    saveMap() {
        return this.mapService.get(this.user.datasets[0])
            .then(dataset => {
                return this.mapService.archive(dataset)
            })
            .then(() => {
                return this.createMap(this.mapName, this.isCreatingEmptyMap)
            })
    }

    private createMap(name: string, isCreatingEmptyMap: boolean): Promise<DataSet> {
        if (isCreatingEmptyMap) {
            return this.mapService.createEmpty(name, this.team.team_id)
        }
        else {
            return this.mapService.createTemplate(name, this.team.team_id)
        }
    }

    getProgress() {
        let progress = Number(Math.ceil((this.currentIndex + 1) / this.steps.length * 100))
        return progress == 100 ? null : progress.toFixed(0)
    }

    getAbsoluteProgress() {
        let stepsLeft = this.steps.length - (this.currentIndex + 1)
        return stepsLeft == 0 ? "You're done!" : `${stepsLeft} steps left`;
    }

    getNextActionName() {
        switch (this.currentStep) {
            case "Welcome":
                return "Start";
            case "Ending":
                return "Start mapping";
            default:
                return "Next";
        }
    }

    getPreviousActionName() {
        return this.currentStep === "Welcome" ? null : "Back";
    }

    getIsClosable() {
        return this.currentStep === "Welcome";
    }

    getIsSkippable() {
        switch (this.currentStep) {
            case "AddMember":
                return true;
            case "Terminology":
                return true;
            default:
                return false;
        }
    }

    onMemberAdded(event: { team: Team, user: User }) {
        this.nextActionName = "Next";
        this.isSkippable = false;
        this.members.push(event.user);
        this.cd.markForCheck();
    }

    onTerminologySaved(team:Team){
        this.nextActionName = "Next";
        this.isSkippable = false;
        this.cd.markForCheck();
    }

    getMemberIndexes() {
        return Array.from({ length: this.MAX_MEMBERS - this.members.length }, (x, i) => i + 1);
    }

    selectColor(color: { name: string, isSelected: boolean }) {
        this.COLORS.forEach(c => c.isSelected = false);
        color.isSelected = true;
        this.selectedColor = color.name;
        this.cd.markForCheck();
    }
}
