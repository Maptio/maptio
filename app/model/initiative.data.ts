import { Injectable, Inject } from '@angular/core'
import { Person } from './person.data';
import { ITraversable } from '../interfaces/traversable.interface'

@Injectable()
export class Initiative implements ITraversable {

    /** Unique Id */
    id: number;

    /** Short name for the initiative. */
    name: string;

    /** Description of initiative */
    description: string = undefined;

    /** Children nodes */
    children: Array<Initiative>;

    /** Starting date of initiative */
    start: Date;

    /**Accountable  */
    accountable: Person;

    /**True if this is the root of the tree */
    //isRoot: boolean = false;

    /**True if this node is focused on */
    hasFocus: boolean = false;

    /**True if this node is zoomed on */
    isZoomedOn: boolean = false;

    /**True if this node matches a search */
    isSearchedFor: boolean = false;

    constructor() { }


    traverse(this: Initiative, callback: ((n: Initiative) => void)): void {
        if (this.children) {
            this.children.forEach(function (child: Initiative) {
                callback.apply(this, [child]);
                if (child.traverse) { //HACK : when object is assigned in building.component.ts , the child nodes should have a traverse method
                    (<Initiative>child).traverse(callback);
                }

            });
        }
    }

    search(searched: string): boolean {
        if (searched === "") {
            return true;
        }
        else {
            if (
                this.name && this.name.toLowerCase().includes(searched.toLowerCase())
                ||
                this.description && this.description.toLowerCase().includes(searched.toLowerCase())
            ) {
                //this.isSearchedFor = true;
                return true;
            }
            return false;
        }
    }

}