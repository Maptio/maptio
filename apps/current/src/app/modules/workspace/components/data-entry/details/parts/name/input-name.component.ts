import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Permissions } from '../../../../../../../shared/model/permission.data';

@Component({
    selector: 'initiative-input-name',
    templateUrl: './input-name.component.html',
    // styleUrls: ['./input-name.component.css']
})
export class InitiativeInputNameComponent implements OnInit {
    @Input("name") name: string;
    @Input("isEditMode") isEditMode: boolean;
    @Input("isUnauthorized") isUnauthorized: boolean;

    @Output("save") save: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild("inputName", { static: false }) inputName: ElementRef;


    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    saveName(newName: string) {
        this.save.emit(newName);
        this.name = newName;
        this.cd.markForCheck();
    }

    onClick() {
        this.isEditMode = true;
        this.cd.markForCheck();
    }

}
