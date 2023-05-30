import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'initiative-helper-privilege',
  templateUrl: './helper-toggle-privilege.component.html',
  styleUrls: ['./helper-toggle-privilege.component.css'],
  standalone: true,
  imports: [NgbTooltipModule, FormsModule],
})
export class InitiativeHelperPrivilegeComponent implements OnInit {
  @Input('helper') helper: Helper;
  @Input('isUnauthorized') isUnauthorized: boolean;
  @Input('isAuthority') isAuthority: boolean;

  @Output('save') save: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  onChange(isToggled: boolean) {
    this.helper.hasAuthorityPrivileges = isToggled;
    this.save.emit(isToggled);
    this.cd.markForCheck();
  }
}
