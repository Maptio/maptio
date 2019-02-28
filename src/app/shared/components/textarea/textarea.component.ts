import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'common-textarea',
    templateUrl: './textarea.component.html',
    // styleUrls: ['./textarea.component.scss']
})
export class CommonTextareaComponent implements OnInit {

    @Input("placeholder") placeholder: string;
    @Input("text") text: string;
    @Input("rows") rows: number;
    @Input("label") label: string = "Edit";

    @Output("save") save: EventEmitter<string> = new EventEmitter<string>();

    isEditMode: boolean;

    constructor() { }

    ngOnInit(): void { }

    onChange(text: string) {
        this.save.emit(text);
    }
}
