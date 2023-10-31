import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Helper } from '../initiative.model';
import { CircleMapService } from '../circle-map.service';
import { NgIf, NgFor } from '@angular/common';
import { SatPopoverModule } from '@wjaspers/sat-popover';

@Component({
  selector: 'g[maptioHelperAvatarSvg]',
  templateUrl: './helper-avatar-svg.component.html',
  styleUrls: ['./helper-avatar-svg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [SatPopoverModule, NgIf, NgFor],
})
export class HelperAvatarSvgComponent implements OnInit {
  @Input() helper!: Helper;

  defaultRadius: 1000;

  roles: string[] = [];
  showRoles = false;

  directoryLink?: string;

  constructor(
    private router: Router,
    private circleMapService: CircleMapService
  ) {}

  ngOnInit(): void {
    this.helper.roles.forEach((role) => {
      if (role && role.title) {
        this.roles.push(role.title);
      }
    });

    this.directoryLink = this.getDirectoryLink();

    this.showRoles = !!this.roles.length;
  }

  onClick($event: MouseEvent) {
    // Avoid triggering click events for the circle when a helper avatar is clicked - especially important on mobile
    $event.stopPropagation();

    if (this.directoryLink) {
      this.router.navigateByUrl(this.directoryLink);
    } else {
      console.error(
        'Helper does not have shortid set or unable to get directory URL'
      );
    }
  }

  private getDirectoryLink() {
    const summaryUrlRoot = this.circleMapService.getSummaryUrlRoot();
    if (summaryUrlRoot && this.helper.shortid) {
      return `${summaryUrlRoot}?member=${this.helper.shortid}`;
    } else {
      return undefined;
    }
  }
}
