import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Component({
    selector: 'common-color-picker',
    templateUrl: './color-picker.component.html',
    // styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

    @Input("color") color: string;
    @Input("label") label:string;
    @Input("default") defaultColor: string;
    @Input("isMinimal") isMinimal: boolean;
    @Output("change") changeColor: EventEmitter<string> = new EventEmitter<string>();

    DEFAULT_COLOR :string = environment.DEFAULT_MAP_TEXT_COLOR;

    constructor() { }

    ngOnInit(): void { }

    pickColor(color: string) {
        this.changeColor.emit(color);
    }

    typeColor(e : {input: string, value: number | string, color: string}) {
        console.log(e)
        this.pickColor(e.color);
    }

    reset(){
        this.pickColor(this.defaultColor);
    }
}
