import { Serializable } from "../interfaces/serializable.interface";
import * as shortid from "shortid";

/**
 * Role i.e. how a helper is contributing to an initiative
 */
export class Role implements Serializable<Role> {

    public shortid?: string;
    public title?: string;
    public description?: string;

    public constructor(init?: Partial<Role>) {
        Object.assign(this, init);
    }

    deserialize(input: any): Role {
        if (!input || (!input.description && !input.title)) return;
        let deserialized = new Role();
        deserialized.shortid = input.shortid;
        deserialized.title = input.title;
        deserialized.description = input.description;
        return deserialized;
    }

    tryDeserialize(input: any): [boolean, Role] {
        try {
            let role = this.deserialize(input);
            if (role !== undefined) {
                return [true, role];
            }
            else {
                return [false, undefined]
            }
        }
        catch (Exception) {
            return [false, undefined]
        }
    };

    isLibraryRole(): boolean {
        return this.shortid ? true : false;
    }

    isCustomRole(): boolean {
        return !this.isLibraryRole();
    }

    convertToLibraryRole(): void {
        if (this.isLibraryRole()) {
            console.error(`Attempting to convert a library role (${this.shortid}) to a library role. Aborting.`);
            return;
        }

        this.shortid = shortid.generate();
    }

    convertToCustomRole() {
        if (this.isCustomRole()) {
            console.error(`Attempting to convert a custom role (${this.title}) to a custom role. Aborting.`);
            return;
        }

        this.shortid = undefined;
    }

    hasTitle() {
        return this.title && this.title.trim() ? true : false;
    }

    hasContent() {
        return  this.hasTitle() || this.description && this.description.trim();
    }

    hasEqualContentAs(otherRole: Role) {
        return this.title === otherRole.title
            && this.description === otherRole.description;
    }

    copyContentFrom(sourceRole: Role) {
        this.title = sourceRole.title;
        this.description = sourceRole.description;
    }
}
