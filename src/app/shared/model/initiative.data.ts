import { Injectable } from "@angular/core"
import { ITraversable } from "../interfaces/traversable.interface"
import { Serializable } from "../interfaces/serializable.interface";
import * as slug from "slug";
import { Helper } from "./helper.data";
import { Role } from "./role.data";
import { compact } from "lodash";
import { Tag } from "./tag.data";

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
    accountable: Helper;

    /**
     * List of helpers
     * REFACTOR : this should be a Set<Helper>
     */
    helpers: Array<Helper> = [];

    /**
     * List of tags
     */
    tags: Array<Tag> = [];

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

    /**True if this node can be dragged&dropped */
    isDraggable: boolean;

    isExpanded: boolean;

    public constructor(init?: Partial<Initiative>) {
        Object.assign(this, init);
    }


    static create() {
        return new Initiative();
    }

    deserialize(input: any): Initiative {
        this.id = input.id;
        this.name = input.name;
        this.description = input.description;
        this.start = input.start;
        this.team_id = input.team_id;
        // this.slug = input.slug;
        if (input.accountable) {
            this.accountable = new Helper().deserialize(input.accountable);
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


        // console.log(input.helpers)
        let helpers = new Array<Helper>()
        if (input.helpers) {
            input.helpers.forEach(function (inputHelper: any) {
                helpers.push(new Helper().deserialize(inputHelper))
            })
        } else {
            helpers = []
        }

        let tags = new Array<Tag>();
        if (input.tags && input.tags instanceof Array) {
            input.tags.forEach(function (inputTag: any) {
                tags.push(new Tag().deserialize(inputTag))
            });
        }
        else {
            tags = []
        }

        this.children = children;
        this.helpers = helpers;
        this.tags = tags;
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

    traversePromise(callback: ((n: Initiative) => Promise<void>)): Array<Promise<void>> {
        let queue: Array<Promise<void>> = [];

        let recursion = (node: Initiative) => {
            // console.log(node.children)
            // queue.push(callback.apply(this, [node]));
            if (node.children) {
                node.children.forEach(function (child: Initiative) {
                    // console.log("name", child.name, "queue length", queue)
                    queue.push(callback.apply(this, [child]));
                    recursion(child)
                });
            }
        }
        recursion(this);
        return queue;
    }

    flatten(): Initiative[] {
        console.log("flattening")
        let array: Initiative[] = [];
        this.traverse(n => {
            array.push(n)
        })
        return array;
    }

    getParent(tree: Initiative): Initiative {
        let parent: Initiative;
        let id = this.id;
        tree.children = tree.children || [];
        if (tree.children.findIndex(c => { return c.id === id }) >= 0) {
            return tree;
        }
        tree.traverse(n => {
            if (n.children && n.children.findIndex(c => c.id === id) >= 0) {
                parent = n
                return;
            }

        })
        return parent;
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

    getSlug() {
        return slug(this.name || "", { lower: true });
    }

    getRoles(userId: string): Role[] {
        return compact([...this.helpers, this.accountable]).filter(h => h.user_id === userId)[0]
            ? compact([...this.helpers, this.accountable]).filter(h => h.user_id === userId)[0].roles
            : [];
    }

}