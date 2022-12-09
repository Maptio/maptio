import { Component, Input } from '@angular/core';
import { SelectableTag } from '@maptio-shared/model/tag.data';

@Component({
  selector: 'tspan[maptioTagSvg]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './tag-svg.component.html',
  styleUrls: ['./tag-svg.component.scss'],
})
export class TagSvgComponent {
  @Input() tag: SelectableTag;
}
