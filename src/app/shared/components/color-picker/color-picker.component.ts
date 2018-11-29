import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'common-color-picker',
    templateUrl: './color-picker.component.html',
    // styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

    @Input("color") color: string;
    @Input("default") defaultColor: string;
    @Input("isMinimal") isMinimal: boolean;
    @Output("change") changeColor: EventEmitter<string> = new EventEmitter<string>();

    constructor() { }

    ngOnInit(): void { }

    change(color: string) {
        this.changeColor.emit(color);
    }

    reset(){
        this.change(this.defaultColor);
    }
}
