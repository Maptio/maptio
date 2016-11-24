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

   static traverse(node : InitiativeNode,callback:((n:InitiativeNode) => void) ) {
       if(node.children)
       {
           node.children.forEach(function(child){
                callback.apply(this,[child]);  
                InitiativeNode.traverse(child, callback);
            })
       }
    }

}