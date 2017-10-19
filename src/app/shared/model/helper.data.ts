import { User } from "./user.data";
import { Serializable } from "../interfaces/serializable.interface";
import { Role } from "./role.data";


export class Helper extends User {

    public roles: Array<Role>;

    public constructor(init?: Partial<Helper>) {
        super()
        Object.assign(this, init);
    }

    deserialize(input: any): Helper {
        if (!input.user_id) {
            return undefined;
        }
        let deserialized = new User().deserialize(input) as Helper;

        let roles = new Array<Role>();
        if (input.roles) {
            input.roles.forEach(function (inputRole: any) {
                roles.push(new Role().deserialize(inputRole));
            });
        }
        else {
            roles = undefined;
        }

        deserialized.roles = roles;
        return deserialized;
    }

    tryDeserialize(input: any): [boolean, Helper] {
        try {
            let helper = this.deserialize(input);
            if (helper !== undefined) {
                return [true, helper];
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