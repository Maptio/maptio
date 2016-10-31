export class InitiativeNode{
    
    id:number;
    name:string;
    person:string;
    isRoot:boolean=false;
    hasFocus:boolean=false;
    description:string= undefined;
    private _size:number = undefined ; //(this.children === undefined ? 0 : this.children.length);
    children:Array<InitiativeNode>;

    get size():number {
        return this._size || 1;
    }

    set size(size:number){
        this._size = size;
    }
}