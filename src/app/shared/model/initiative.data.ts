import { Injectable } from "@angular/core"
import { ITraversable } from "../interfaces/traversable.interface"
import { Serializable } from "../interfaces/serializable.interface";
import { Team } from "./team.data";
import { User } from "./user.data";
import * as slug from "slug";

@Injectable()
export class Initiative implements ITraversable, Serializable<Initiative> {

    /** Unique Id */
    id: number;

    /** Short name for the initiative. */
    name: string;

    /**
     * URL friendly name
      */
    // slug: string = slug(this.name);

    /** Description of initiative */
    description: string = undefined;

    /** Children nodes */
    children: Array<Initiative>;

    /** Starting date of initiative */
    start: Date;

    /**Accountable  */
    accountable: User;

    /**
     * List of helpers
     */
    helpers: Array<User>;

    /**
     * Team
     */
    // private _URL = "assets/images/logo.png"
    // private _MEMBERS = [
    //     new User({ name: "Safiyya", picture: this._URL, user_id: "safiyya_id" }),
    //     new User({ name: "Gabriel", picture: this._URL, user_id: "gabriel_id" }),
    //     new User({ name: "Kamil", picture: this._URL, user_id: "kamil_id" }),
    //     new User({ name: "Mouris", picture: this._URL, user_id: "mouris_id" }),
    //     new User({ name: "Nassera", picture: this._URL, user_id: "nassera_id" })]

    team_id: string;

    // @ignore
    // team: Team; //= new Team({ members: this._MEMBERS });

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
        this.team_id = input.team_id;
        // this.slug = input.slug;
        if (input.accountable) {
            this.accountable = new User().deserialize(input.accountable);
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

        let helpers = new Array<User>()
        if (input.helpers) {
            input.helpers.forEach(function (inputHelper: any) {
                helpers.push(new User().deserialize(inputHelper))
            })
        } else {
            helpers = []
        }

        this.children = children;
        this.helpers = helpers;
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

    getSlug(){
        return slug(this.name, {lower:true});
    }



}