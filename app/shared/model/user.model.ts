import { Serializable } from '../interfaces/serializable.interface';

export class AuthenticatedUser implements Serializable<AuthenticatedUser> {

    public name: string;
    public email: string;
    public picture: string;

    constructor() { }

    deserialize(input: any): AuthenticatedUser {
        let deserialized = new AuthenticatedUser();
        deserialized.name = input.name || undefined;
        deserialized.email = input.email || undefined;
        deserialized.picture = input.picture || undefined;
        return deserialized;
    }

    tryDeserialize(input: any): [boolean, AuthenticatedUser] {
        try {
            let user = this.deserialize(input);
            if (user !== undefined) {
                return [true, user];
            }
            else {
                return [false, undefined]
            }
        }
        catch (Exception) {
            return [false, undefined]
        }
    }
}