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
import { MarkdownModule } from 'ngx-markdown';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgFor, MarkdownModule]
})
export class TooltipComponent {
  @Input('initiative') initiative: Initiative;
  @Input('isNameOnly') isNameOnly: boolean;
  @Input('team') team: Team;

  constructor() {}
}
