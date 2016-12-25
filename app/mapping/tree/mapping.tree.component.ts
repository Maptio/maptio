import { Component, OnInit } from '@angular/core';
import {
    D3Service, D3, Selection,
    PackLayout, HierarchyNode, HierarchyCircularNode,
    Transition, Timer, BaseType
} from 'd3-ng2-service';
import { ColorService } from '../../services/color.service'
import { UIService } from '../../services/ui.service'


@Component({
    selector: 'tree',
    templateUrl: 'mapping.tree.component.html'
})
export class MappingTreeComponent implements OnInit {
    private d3: D3;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService) {
        this.d3 = d3Service.getD3();
    }
    ngOnInit() { }

    draw(data:any){
        this.uiService.clean();
    }
}