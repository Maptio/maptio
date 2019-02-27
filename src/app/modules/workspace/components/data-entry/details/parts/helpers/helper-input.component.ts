import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { Team } from '../../../../../../../shared/model/team.data';

@Component({
    selector: 'initiative-helper-input',
    templateUrl: './helper-input.component.html',
    // styleUrls: ['./helper-input.component.css']
})
export class InitiativeHelperInputComponent implements OnInit {
    @Input("helper") helper:Helper;
    @Input("team") team:Team;
    @Input("isEditMode") isEditMode:boolean;
    @Input("summaryUrl") summaryUrl:string;
    @Input("isAuthority") isAuthority:boolean;
    
    @Output("remove") remove :EventEmitter<Helper> = new EventEmitter<Helper>();
    constructor() { }

    ngOnInit(): void { }

    onRemove(){
        this.remove.emit(this.helper);
    }
}
