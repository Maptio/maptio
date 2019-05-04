import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { environment } from '../../../config/environment';
import { ColorEvent } from 'ngx-color';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'common-color-picker',
    templateUrl: './color-picker.component.html',
    // styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

    @Input("color") color: string;
    @Input("label") label: string;
    @Input("placement") placement?: string="top";
    @Input("default") defaultColor: string;
    @Input("isMinimal") isMinimal: boolean;
    @Output("change") changeColor: EventEmitter<string> = new EventEmitter<string>();
    
    @ViewChild("popover") popover:NgbPopover;

    constructor() { }

    ngOnInit(): void { 
        
    }

    pickColor(e: ColorEvent) {
        this.changeColor.emit(e.color.hex);
    }

    close(){
        this.popover.close();
    }

    reset() {
        this.pickColor(<ColorEvent>{
            color : {
                hex : this.defaultColor
            }
        });
    }
}
