import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MappingComponent } from '@maptio-old-workspace/components/canvas/mapping.component';

@Component({
  selector: 'maptio-map-container',
  standalone: true,
  imports: [CommonModule, MappingComponent],
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
})
export class MapContainerComponent {
  public isLoading: boolean;
}
