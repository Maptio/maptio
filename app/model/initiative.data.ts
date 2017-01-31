import { Injectable, Inject } from '@angular/core'
import { Person } from './person.data';
import {ITreeNode} from '../interfaces/treenode.interface'

@Injectable()
export class InitiativeNode implements ITreeNode{

    /** Unique Id */
    id: number;

    /** Short name for the initiative. */
    name: string;

    /** Description of initiative */
    description: string = undefined;

    /** Children nodes */
    children: Array<InitiativeNode>;

    /** Starting date of initiative */
    start: Date;

    /**Accountable  */
    accountable: Person;

    /**True if this is the root of the tree */
    isRoot: boolean = false;

    /**True if this node is focused on */
    hasFocus: boolean = false;

    /**True if this node is zoomed on */
    isZoomedOn: boolean = false;

    /**True if this node matches a search */
    isSearchedFor: boolean = false;

    /**Size of node -- DEPRECATED */
    // private size: number = 1;


    constructor() { }

}