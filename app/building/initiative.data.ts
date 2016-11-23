import {Injectable, Inject} from '@angular/core'

@Injectable()
export class InitiativeNode{
    
    id:number;
    name:string;
    isRoot:boolean=false;
    hasFocus:boolean=false;
    isZoomedOn:boolean= false;
    description:string= undefined;
    private _size:number = undefined ; //(this.children === undefined ? 0 : this.children.length);
    children:Array<InitiativeNode>;

    constructor(){}

    get size():number {
        return this._size || 1;
    }

    set size(size:number){
        this._size = size;
    }

    traverse(this : InitiativeNode,callback:((n:InitiativeNode) => void) ) {
       this.children.forEach(function(child:InitiativeNode){
           callback.apply(this,[child]);  
           child.traverse(callback);
       })
    }

}