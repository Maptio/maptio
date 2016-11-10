export class InitiativeNode{
    
    private _id:number= undefined;
    name:string;
    //person:string;
    isRoot:boolean=false;
    hasFocus:boolean=false;
    description:string= undefined;
    private _size:number = undefined ; //(this.children === undefined ? 0 : this.children.length);
    children:Array<InitiativeNode>;

    constructor(obj:any){
        if(obj){
        this.name = obj.name ? obj.name :  null;
        this.isRoot = obj.isRoot;
        this.hasFocus = obj.hasFocus;
        this.description = obj.description;
        this._size = obj.size;
        this._id = obj.id;
        this.children = obj.children;
        }
        
    }

    get size():number {
        return this._size || 1;
    }

    set size(size:number){
        this._size = size;
    }

    get id():number {
        this._id = this._id ? this._id : Math.floor(Math.random() * 1000) + 1 ;
       // console.log(this.name + " : " +this._id);
        return this._id;
    }

    set id(id:number){
        this._id = id;
    }
}