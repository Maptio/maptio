import { Component, OnInit, Output, Input , EventEmitter, ChangeDetectorRef} from '@angular/core';

@Component({
    selector: 'initiative-input-name',
    templateUrl: './input-name.component.html',
    // styleUrls: ['./input-name.component.css']
})
export class InitiativeInputNameComponent implements OnInit {
    @Input("name") name:string;
    @Input("isEditMode") isEditMode:boolean;

    @Output("save") save : EventEmitter<string> = new EventEmitter<string>();
 
    constructor(private cd:ChangeDetectorRef) { }

    ngOnInit(): void { }

    saveName(newName:string){
        this.save.emit(newName);
        this.name = newName;
        this.cd.markForCheck();
    }
}
