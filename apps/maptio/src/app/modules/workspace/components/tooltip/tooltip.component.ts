import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  ViewChild,
} from '@angular/core';
import { Initiative } from '../../../../shared/model/initiative.data';
import { Team } from '../../../../shared/model/team.data';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input('initiative') initiative: Initiative;
  @Input('isNameOnly') isNameOnly: boolean;
  @Input('team') team: Team;

  constructor() {}
}
