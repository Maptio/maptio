import { Component, Input } from '@angular/core';
import { SelectableTag } from '@maptio-shared/model/tag.data';
import { SatPopoverModule } from '@wjaspers/sat-popover';

@Component({
    selector: 'tspan[maptioTagSvg]',
    templateUrl: './tag-svg.component.html',
    styleUrls: ['./tag-svg.component.scss'],
    standalone: true,
    imports: [SatPopoverModule]
})
export class TagSvgComponent {
  @Input() tag: SelectableTag;
}
