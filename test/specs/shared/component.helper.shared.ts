import {Component} from '@angular/core';


export interface IAnchorableComponent{}

@Component({
    selector:'component',
    template:'Hello'
})
export class AnAnchorableComponent implements IAnchorableComponent{
    name:string = "Some value";
}
