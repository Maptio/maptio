import { Serializable } from "../interfaces/serializable.interface";


export class Role implements Serializable<Role> {

    public description: string;

    public constructor(init?: Partial<Role>) {
        Object.assign(this, init);
    }

    deserialize(input: any): Role {
        if (!input || !input.description) return
        let deserialized = new Role();
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