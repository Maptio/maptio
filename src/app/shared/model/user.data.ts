import { Serializable } from "../interfaces/serializable.interface";
import * as slug from "slug";

export class User implements Serializable<User> {

    /**
     * Unique Id (specific to Auth0 schema)
     */
    public user_id: string;

    /**
     * Team short id (URL friendly)
     */
    public shortid: string;

    /**
     * User name
     */
    public name: string;

    /**
     * User firstnmae
     */
    public firstname: string;


    /**
     * User last name
     */
    public lastname: string;

    /**
     * User nickname
     */
    public nickname: string;

    /**
     * User email
     */
    public email: string;

    /**
     * User picture URL
     */
    public picture: string;

    /**
     * True is activation is pending, false otherwise
     */
    public isActivationPending: boolean = false;

    /**
     * True is a invitation has been sent to this user, false otherwise
     */
    public isInvitationSent: boolean = false;

    /**
     * True if the user has been deleted (from Auth0 for instance)
     */
    public isDeleted: boolean = false;

    /**
     * List of teams
     */
    public teams: any[];

    /**
     * List of datasets
     */
    public datasets: any[];

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }

    static create(): User {
        return new User();
    }

    deserialize(input: any): User {

        if (!input.user_id) {
            return undefined;
        }
        let deserialized = new User();
        deserialized.shortid = input.shortid;
        deserialized.firstname = input.firstname || (input.user_metadata ? input.user_metadata.given_name : input.given_name);
        deserialized.lastname = input.lastname || (input.user_metadata ? input.user_metadata.family_name : input.family_name);
        deserialized.name = ((deserialized.firstname) && (deserialized.lastname)) ? `${deserialized.firstname || ""} ${deserialized.lastname || ""}` : input.name;
        deserialized.isActivationPending = input.app_metadata && input.app_metadata.activation_pending ? input.app_metadata.activation_pending : false;
        deserialized.isInvitationSent = input.app_metadata && input.app_metadata.invitation_sent ? input.app_metadata.invitation_sent : false;

        deserialized.nickname = input.nickname;
        deserialized.email = input.email;
        deserialized.picture = ( input.user_metadata && input.user_metadata.picture) ? input.user_metadata.picture : input.picture;
        deserialized.user_id = input.user_id; // specific to Auth0
        // deserialized.isEmailVerified = input.isEmailVerified || input.email_verified;
        // deserialized.loginsCount = input.loginsCount || input.logins_count;
        deserialized.teams = [];
        if (input.teams) {
            input.teams.forEach((t: any) => {
                deserialized.teams.push(t);
            });
        }
        deserialized.datasets = []
        if (input.datasets) {
            input.datasets.forEach((d: any) => {
                deserialized.datasets.push(d);
            });
        }
        return deserialized;
    }

    tryDeserialize(input: any): [boolean, User] {
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

    // getHomePage() {
    //     if (this.datasets.length === 1) {
    //         let mapid = this.datasets[0];
    //         return `/map/${mapid}/me`;
    //     }
    //     else {
    //         return "/home"
    //     }
    // }

    getSlug() {
        // support for non latin character is lackign for now
        // HACK : is slug is empty, return "user"
        return slug(this.name || this.nickname || "", { lower: true }) || "user";
    }
}

export class SelectableUser extends User {

    public isSelected: boolean;

    public constructor(init?: Partial<SelectableUser>) {
        super()
        Object.assign(this, init);
    }
}