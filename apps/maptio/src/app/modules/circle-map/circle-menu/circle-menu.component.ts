import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'g[maptioCircleMenu]',
  templateUrl: './circle-menu.component.html',
  styleUrls: ['./circle-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, MatMenuModule],
})
export class CircleMenuComponent {
  @Input() defaultRadius: number;
  @Input() menu: MatMenu;
}
