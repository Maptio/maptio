import { Component, OnInit, ChangeDetectorRef, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../model/user.data';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { TeamService } from '../../services/team/team.service';
import { MapService } from '../../services/map/map.service';
import { environment } from '../../../config/environment';
// import { Steps } from './instructions.enum';



@Component({
    selector: 'common-instructions',
    templateUrl: './instructions.component.html',
    styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

    currentIndex: number = 0;
    currentStep: string;
    nextActionName: string = "Get started";
    previousActionName: string = null;
    progress: string = "14";
    progressLabel: string = "6 steps left";
    isRedirecting: boolean;

    @Input("user") user: User;
    @Input("steps") steps: string[];
    @Input("dataset") dataset: DataSet;
    @Input("team") team: Team;

    constructor(public activeModal: NgbActiveModal, private cd: ChangeDetectorRef,
        private teamService: TeamService, private mapService: MapService, private router: Router) { }

    ngOnInit(): void {
        this.currentStep = this.steps[this.currentIndex];
        this.progress = this.getProgress()
        this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`
      

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.steps && changes.steps.currentValue) {
            this.currentStep = changes.steps.currentValue[this.currentIndex];
        }
    }

    close() {
        this.activeModal.close();
    }

    nextStep() {
        if (this.currentIndex === this.steps.length - 1) {
            if (this.user.teams.length === 0) {
                return this.getDemoMap(this.user)
                    .then((dataset: DataSet) => {
                        return dataset;
                    })
                    .then((dataset: DataSet) => {
                        this.isRedirecting = true;
                        this.cd.markForCheck();
                        return this.router.navigateByUrl(`/map/${dataset.datasetId}/${dataset.initiative.getSlug()}`);
                    })
                    .then(() => {
                        this.isRedirecting = false;
                        this.cd.markForCheck();
                        this.activeModal.close();
                    })
            }
            else {
                this.close();
            }

        }

        this.currentIndex += 1;
        this.currentStep = this.steps[this.currentIndex]
        this.nextActionName = this.getNextActionName();
        this.previousActionName = this.getPreviousActionName();
        this.progress = this.getProgress()
        this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`
        this.cd.markForCheck();
    }

    previousStep() {
        this.currentIndex -= 1;
        this.currentStep = this.steps[this.currentIndex]
        this.nextActionName = this.getNextActionName();
        this.previousActionName = this.getPreviousActionName();
        this.progress = this.getProgress()
        this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`

        this.cd.markForCheck();
    }

    getNextActionName() {
        if (this.currentIndex === this.steps.length - 1) {
            return this.currentStep === "Ending" ? "Go to sample map" : "Done"
        } else {
            return "Next"
        }
    }

    getPreviousActionName() {
        return this.currentStep === "Welcome" ? null : "Back";
    }

    getDemoMap(user: User): Promise<DataSet> {
        return this.teamService.createDemoTeam(user)
            .then(team => {
                return this.mapService.createExample(team.team_id)
            })
    }

    getProgress() {
        let progress = Number(Math.ceil((this.currentIndex + 1) / this.steps.length * 100))
        return progress == 100 ? null : progress.toFixed(0)
    }

    getAbsoluteProgress() {
        let stepsLeft = this.steps.length - (this.currentIndex + 1)
        return stepsLeft == 0 ? "You're done!" : `${stepsLeft} steps left`;
    }
}
