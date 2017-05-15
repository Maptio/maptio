import { User } from './user.data';
import { Serializable } from "../interfaces/serializable.interface";
// import { Person } from "./person.data"

export class Team implements Serializable<Team>{

    /**
     * Unique Id
     */
    public team_id: string;

    /**
     * Name of team
     */
    public name: string;

    /**
     * List of team members
     */
    public members: Array<User>;

    public constructor(init?: Partial<Team>) {
        Object.assign(this, init);
    }

    static create(): Team {
        return new Team();
    }

    deserialize(input: any): Team {
        let deserialized = new Team();
        deserialized.name = input.name;

        if (input.members) {
            deserialized.members = []
            input.members.forEach((member: any) => {
                deserialized.members.push(User.create().deserialize(member))
            });
        }

        return deserialized;
    }

    tryDeserialize(input: any): [boolean, Team] {
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