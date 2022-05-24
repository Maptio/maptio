import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';

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
    @Input("isUnauthorized") isUnauthorized:boolean;
    @Input("isHeader") isHeader:boolean; 

    @Output("save") save: EventEmitter<string> = new EventEmitter<string>();

    isEditMode: boolean;
    isTextEmpty:boolean =true;
    showUnauthorized:boolean;

    KB_URL_MARKDOWN = environment.KB_URL_MARKDOWN;

    constructor(private cd:ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.text){
            this.isTextEmpty = !changes.text.currentValue || changes.text.currentValue.trim() === ''; 
        }
    }

    onChange(text: string) {
        this.text = text;
        this.save.emit(text);
        this.cd.markForCheck();
    }
}
