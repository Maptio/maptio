import { Serializable } from '../interfaces/serializable.interface';

export class AuthenticatedUser implements Serializable<AuthenticatedUser> {

    public name: string;
    public email: string;
    public picture: string;

    public constructor(init?: Partial<AuthenticatedUser>) {
        Object.assign(this, init);
    }


    static create(): AuthenticatedUser {
        return new AuthenticatedUser();
    }

    deserialize(input: any): AuthenticatedUser {
        if (!input.name && !input.email && !input.picture) { return undefined; }
        let deserialized = new AuthenticatedUser();
        deserialized.name = input.name;
        deserialized.email = input.email;
        deserialized.picture = input.picture;
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