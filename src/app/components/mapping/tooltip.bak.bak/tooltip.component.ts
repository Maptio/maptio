import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tooltip',
    template: `
        <div>Name : {{name}}
    `
})
export class TooltipComponent implements OnInit {

    public name:string = "Mama";
    constructor() { }

    ngOnInit() {
        console.log("here")
     }
}