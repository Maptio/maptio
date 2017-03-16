import { Injectable } from "@angular/core"
import { Person } from "./person.data";
import { ITraversable } from "../interfaces/traversable.interface"
import { Serializable } from "../interfaces/serializable.interface";

@Injectable()
export class Initiative implements ITraversable, Serializable<Initiative> {

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
    // isRoot: boolean = false;

    /**True if this node is focused on */
    hasFocus: boolean = false;

    /**True if this node is zoomed on */
    isZoomedOn: boolean = false;

    /**True if this node matches a search */
    isSearchedFor: boolean = false;

    public constructor() { }

    deserialize(input: any): Initiative {
        this.id = input.id;
        this.name = input.name;
        this.description = input.description;
        this.start = input.start;
        if (input.accountable) {
            this.accountable = new Person().deserialize(input.accountable);
        }

        let children = new Array<Initiative>();
        if (input.children) {
            input.children.forEach(function (inputChild: any) {
                children.push(new Initiative().deserialize(inputChild));
            });
        }
        else {
            children = undefined;
        }

        this.children = children;
        return this;
    }

    /** N */
    tryDeserialize(input: any): [boolean, Initiative] {
        throw new Error("Not implemented");
    }

    traverse(callback: ((n: Initiative) => void)): void {
        if (this.children) {
            this.children.forEach(function (child: Initiative) {
                callback.apply(this, [child]);
                (<Initiative>child).traverse(callback);
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
                return true;
            }
            return false;
        }
    }



}