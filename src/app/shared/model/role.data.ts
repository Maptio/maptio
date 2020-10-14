import { Serializable } from "../interfaces/serializable.interface";

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
        if (!input) return
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
}
