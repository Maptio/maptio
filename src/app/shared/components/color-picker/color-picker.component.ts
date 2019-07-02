import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
    @Input("placement") placement?: string = "top";
    @Input("default") defaultColor: string;
    @Input("isMinimal") isMinimal: boolean;
    @Output("change") changeColor: EventEmitter<string> = new EventEmitter<string>();

    toggleColorPicker: boolean;
    DEFAULT_PRESETS_COLORS = environment.DEFAULT_PRESETS_COLORS;

    @ViewChild('colorSelector') element: ElementRef;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.styleSwatch();
    }

    styleSwatch() {
        let selector = `.swatch[title="${this.color}"], .swatch[title="${this.color.toUpperCase()}"], .swatch[title="${this.color.toLowerCase()}"]`;
        if((this.element.nativeElement as HTMLElement).querySelector(".swatch.selected")){
            (this.element.nativeElement as HTMLElement).querySelector(".swatch.selected").classList.remove("selected");
        }
        if ((this.element.nativeElement as HTMLElement).querySelector(selector)) {
            (this.element.nativeElement as HTMLElement).querySelector(selector).classList.add("selected")
        }
    }

    pickColor(e: ColorEvent) {
        this.color = e.color.hex;
        this.changeColor.emit(e.color.hex);
        this.cd.markForCheck();
        this.styleSwatch();
    }


    reset() {
        this.pickColor(<ColorEvent>{
            color: {
                hex: this.defaultColor
            }
        });
    }
}
