import { User } from './user.data';
// import { Person } from "./person.data"

export class Team {
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
}