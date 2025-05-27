import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ItemMenuComponent,
  ItemMenuButtonComponent,
  NbMenuItemComponent,
} from '@notebits/sdk';

@Component({
  selector: 'g[maptioCircleMenu]',
  templateUrl: './circle-menu.component.html',
  styleUrls: ['./circle-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ItemMenuComponent,
    ItemMenuButtonComponent,
    NbMenuItemComponent,
  ],
})
export class CircleMenuComponent {
  @Input() defaultRadius: number;
}
