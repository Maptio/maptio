import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { isEmpty } from 'lodash';
import { User } from '../../model/user.data';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamService } from '../../services/team/team.service';
import { Router } from '@angular/router';
import { MapService } from '../../services/map/map.service';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

import { OpenReplayService } from '@maptio-shared/services/open-replay.service';
import { ConsentComponent } from './consent.component';
import { AddTerminologyComponent } from './add-terminology.component';
import { FormsModule } from '@angular/forms';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { CommonModalComponent } from '../modal/modal.component';

@Component({
    selector: 'maptio-common-onboarding',
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.css'],
    standalone: true,
    imports: [CommonModalComponent, NgIf, NgTemplateOutlet, FormsModule, AddTerminologyComponent, ConsentComponent]
})
export class OnboardingComponent implements OnInit {
  @Input() user: User;
  @Input() steps: string[];

  currentStep: string;
  currentIndex = 0;
  nextActionName = $localize`:onboarding|Button to start onboarding process@@start:Start`;
  previousActionName: string = null;
  progress: string;
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
    private openReplayService: OpenReplayService,
    private mixpanel: Angulartics2Mixpanel,
    private teamService: TeamService,
    private mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentStep = this.steps[this.currentIndex];
    this.members = [this.user];
    this.progress = this.getProgress();

    if (this.user.teams.length === 0) {
      this.team = new Team({ name: '' });
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
        this.teamCreationErrorMessage = $localize`:onboarding|Error message when an organisation name isn't provided:We need a name to continue.`;
        this.nextActionName = $localize`:onboarding|Button to progress to next step of onbaording@@next:Next`;
        this.cd.markForCheck();
        return;
      } else {
        this.isCreatingTeam = true;
        this.nextActionName = $localize`:onboarding|Message shown after the organisation name is entered and the "Next" button is pressed:Setting up your organisation`;
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
    } else if (this.currentStep === 'Consent') {
      this.startSessionRecordingIfConsentIsGiven();
      this.sendOnboardingEventToMixpanel();

      this.isCreatingMap = true;
      this.nextActionName = $localize`:onboarding|Message shown after the last step of onboarding:Creating your map`;

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

  private startSessionRecordingIfConsentIsGiven() {
    if (this.user.consentForSessionRecordings) {
      this.openReplayService.start();
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
    this.isSkippable = this.getIsSkippable();
    this.progress = this.getProgress();

    this.cd.markForCheck();
  }

  previousStep() {
    this.currentIndex -= 1;
    this.currentStep = this.steps[this.currentIndex];
    this.nextActionName = this.getNextActionName();
    this.previousActionName = this.getPreviousActionName();
    this.isSkippable = this.getIsSkippable();
    this.progress = this.getProgress();

    this.cd.markForCheck();
  }

  saveTeam(team: Team): Promise<Team> {
    return this.teamService.exist(team).then((exist: boolean) => {
      if (exist) {
        return this.teamService.save(team);
      } else {
        return this.teamService.create(team.name, this.user, true);
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

  getNextActionName() {
    switch (this.currentStep) {
      case 'Welcome':
        return $localize`:@@start:Start`;
      case 'Consent':
        return $localize`:onboarding|Button to exit the onboarding process and start using the app:Start mapping`;
      default:
        return $localize`:@@next:Next`;
    }
  }

  getPreviousActionName() {
    return this.currentStep === 'Welcome' ? null : $localize`Back`;
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
