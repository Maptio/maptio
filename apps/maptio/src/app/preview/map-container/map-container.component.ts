import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'maptio-map-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
})
export class MapContainerComponent {
  public isLoading: boolean;
}
