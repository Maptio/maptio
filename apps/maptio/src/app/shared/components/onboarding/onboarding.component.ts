import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { isEmpty } from 'lodash';
import { User } from '../../model/user.data';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamService } from '../../services/team/team.service';
import { Router } from '@angular/router';
import { MapService } from '../../services/map/map.service';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

@Component({
  selector: 'maptio-common-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class OnboardingComponent implements OnInit {
  @Input() user: User;
  @Input() steps: string[];

  currentStep: string;
  currentIndex = 0;
  nextActionName = 'Start';
  previousActionName: string = null;
  progress: string;
  progressLabel: string;
  isClosable = true;
  isSkippable: boolean;

  teamCreationErrorMessage: string;
  mapCreationErrorMessage: string;
  isTerminologySaved: boolean;
  COLORS = [
    { name: '#aaa', isSelected: false },
    { name: 'blue', isSelected: false },
    { name: 'purple', isSelected: false },
    { name: 'brown', isSelected: false },
    { name: 'red', isSelected: false },
    { name: 'orange', isSelected: false },
  ];
  selectedColor: string = this.COLORS[0].name;
  mapName: string;

  isCreatingTeam: boolean;
  isCreatingMap = false;

  members: User[];
  team: Team;
  dataset: DataSet;

  constructor(
    public activeModal: NgbActiveModal,
    private cd: ChangeDetectorRef,
    private mixpanel: Angulartics2Mixpanel,
    private teamService: TeamService,
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentStep = this.steps[this.currentIndex];
    this.members = [this.user];
    this.progress = this.getProgress();
    this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`

    if (this.user.teams.length === 0) {
      this.team = new Team({ name: '' });
      console.log('creating team', this.team);
    } else {
      // TODO: In the future, when we get rid of all old data with
      // example teams, we will be able to remove this.
      this.getFirstNonExampleTeamOrCreateNewOne();
    }
  }

  private getFirstNonExampleTeamOrCreateNewOne() {
    this.teamService.get(this.user).then((teams: Team[]) => {
      const nonExampleTeams = teams.filter((t) => !t.isExample);
      if (nonExampleTeams.length === 1) {
        this.team = nonExampleTeams[0];
      } else {
        this.team = new Team({ name: '' });
      }
    });
  }

  close() {
    this.activeModal.dismiss();
  }

  nextStep() {
    if (this.isCreatingTeam || this.isCreatingMap) {
      return;
    }

    if (this.currentStep === 'CreateTeam') {
      this.isCreatingTeam = false;
      this.cd.markForCheck();
      if (isEmpty(this.team.name)) {
        this.teamCreationErrorMessage = 'We need a name to continue.';
        this.nextActionName = 'Next';
        this.cd.markForCheck();
        return;
      } else {
        this.isCreatingTeam = true;
        this.nextActionName = 'Setting up your organisation';
        this.teamCreationErrorMessage = null;
        this.cd.markForCheck();
        this.saveTeam(this.team).then((team) => {
          this.isCreatingTeam = false;
          this.team = team;
          this.mapName = `${team.name} map`;
          this.goToNextStep();
          this.cd.markForCheck();
        });
      }
    } else if (this.currentStep === 'Terminology') {
      this.sendOnboardingEventToMixpanel();

      this.isCreatingMap = true;
      this.nextActionName = 'Creating your map';

      return this.createMap(this.mapName)
        .then((dataset) => {
          this.dataset = dataset;
          this.mapCreationErrorMessage = null;

          return this.router.navigateByUrl(
            `/map/${
              this.dataset.datasetId
            }/${this.dataset.initiative.getSlug()}`
          );
        })
        .then(() => {
          this.cd.markForCheck();
          this.activeModal.close();
        });
    } else {
      this.goToNextStep();
    }
  }

  private sendOnboardingEventToMixpanel() {
    this.mixpanel.eventTrack('Onboarding', {
      step: this.steps[this.currentIndex - 1],
      members: this.members.length,
      authority: this.team.settings.authority,
      helper: this.team.settings.helper,
      mapName: this.mapName,
    });
  }

  private goToNextStep() {
    this.currentIndex += 1;
    this.currentStep = this.steps[this.currentIndex];
    this.nextActionName = this.getNextActionName();
    this.previousActionName = this.getPreviousActionName();
    this.isClosable = this.getIsClosable();
    this.isSkippable = this.getIsSkippable();
    this.progress = this.getProgress();
    this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`

    this.cd.markForCheck();
  }

  previousStep() {
    this.currentIndex -= 1;
    this.currentStep = this.steps[this.currentIndex];
    this.nextActionName = this.getNextActionName();
    this.previousActionName = this.getPreviousActionName();
    this.isClosable = this.getIsClosable();
    this.isSkippable = this.getIsSkippable();
    this.progress = this.getProgress();
    this.progressLabel = this.getAbsoluteProgress(); //`${this.steps.length - (this.currentIndex + 1)} steps left`

    this.cd.markForCheck();
  }

  saveTeam(team: Team): Promise<Team> {
    return this.teamService.exist(team).then((exist: boolean) => {
      if (exist) {
        return this.teamService.save(team);
      } else {
        return this.teamService.create(
          team.name,
          this.user,
          [this.user],
          false,
          false
        );
      }
    });
  }

  private createMap(name: string): Promise<DataSet> {
    return this.mapService.createTemplate(name, this.team.team_id);
  }

  getProgress() {
    const progress = Number(
      Math.ceil(((this.currentIndex + 1) / this.steps.length) * 100)
    );
    return progress == 100 ? null : progress.toFixed(0);
  }

  getAbsoluteProgress() {
    const stepsLeft = this.steps.length - (this.currentIndex + 1);
    return stepsLeft == 0 ? "You're done!" : `${stepsLeft} steps left`;
  }

  getNextActionName() {
    switch (this.currentStep) {
      case 'Welcome':
        return 'Start';
      case 'Terminology':
        return 'Start mapping';
      default:
        return 'Next';
    }
  }

  getPreviousActionName() {
    return this.currentStep === 'Welcome' ? null : 'Back';
  }

  getIsClosable() {
    return this.currentStep === 'Welcome';
  }

  getIsSkippable() {
    return false;
  }

  onTerminologySaved() {
    this.isSkippable = false;
    this.cd.markForCheck();
  }

  selectColor(color: { name: string; isSelected: boolean }) {
    this.COLORS.forEach((c) => (c.isSelected = false));
    color.isSelected = true;
    this.selectedColor = color.name;
    this.cd.markForCheck();
  }
}
