import { Component, OnInit, Input } from '@angular/core';
import { Tag } from '../../../../../../../shared/model/tag.data';

@Component({
    selector: 'initiative-single-tag',
    templateUrl: './single-tag.component.html'
})
export class InitiativeSingleTagComponent implements OnInit {
@Input("tag") tag:Tag;

    constructor() { }

    ngOnInit(): void { }
}