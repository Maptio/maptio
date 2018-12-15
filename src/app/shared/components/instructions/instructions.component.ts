import { Component, OnInit, ChangeDetectorRef, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../model/user.data';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { TeamService } from '../../services/team/team.service';
import { MapService } from '../../services/map/map.service';
// import { Steps } from './instructions.enum';



@Component({
    selector: 'common-instructions',
    templateUrl: './instructions.component.html',
    styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

    currentIndex: number = 0;
    currentStep: string;
    nextActionName: string = "Next";
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
        console.log("ngOnInit", this.steps);
        this.currentStep = this.steps[this.currentIndex];

    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log("ngOnChanges", changes)
        if (changes.steps && changes.steps.currentValue) {
            this.currentStep = changes.steps.currentValue[this.currentIndex];
        }
    }

    close() {
        this.activeModal.dismiss();
    }

    nextStep() {
        if (this.currentIndex === this.steps.length - 1) {
            if (this.user.teams.length === 0) {
                return this.getDemoMap(this.user)
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
}
