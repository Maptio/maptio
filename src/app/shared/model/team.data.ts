import { SlackIntegration } from "./integrations.data";
import { Serializable } from "./../interfaces/serializable.interface";
import { User } from "./user.data";
import * as slug from "slug";
import * as moment from 'moment';
import { create } from "domain";




/**
 * Represents a team
 */
export class Team implements Serializable<Team> {

    /**
     * Unique Id
     */
    public team_id: string;

    /**
     * Team short id (URL friendly)
     */
    public shortid: string;

    /**
     * Name of team
     */
    public name: string;


    /**
     * List of team members
     */
    public members: Array<User>;

    public settings: { authority: string, helper: string };

    public slack: SlackIntegration;

    public createdAt: Date;

    public freeTrialLength: Number;

    public isPaying: Boolean;

    public constructor(init?: Partial<Team>) {
        Object.assign(this, init);
    }

    static create(): Team {
        return new Team();
    }

    deserialize(input: any): Team {
        if (!input._id) {
            return undefined;
        }


        let deserialized = new Team();
        deserialized.name = input.name;
        deserialized.team_id = input._id;
        deserialized.shortid = input.shortid;
        if (input.members) {
            deserialized.members = []
            input.members.forEach((member: any) => {
                deserialized.members.push(User.create().deserialize(member))
            });
        }
        deserialized.settings = { authority: "Lead", helper: "Contributor" }
        deserialized.settings.authority = input.settings ? input.settings.authority || "Lead" : "Lead";
        deserialized.settings.helper = input.settings ? input.settings.helper || "Contributor" : "Contributor"
        deserialized.slack = SlackIntegration.create().deserialize(input.slack || {});
        // console.log("deserialize team", input.slack, deserialized.slack)


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

    getSlug(): string {
        return slug(this.name || "", { lower: true })
    }

    getRemainingTrialDays() {
        let cutoffDate = moment(this.createdAt).add(<moment.DurationInputArg1>this.freeTrialLength, "d");
        // console.log(this.createdAt, cutoffDate, moment.duration(cutoffDate.diff(moment())).asDays())
        return Math.ceil(moment.duration(cutoffDate.diff(moment())).asDays());
    }

    isTeamLateOnPayment(){
        let cutoffDate = moment(this.createdAt).add(<moment.DurationInputArg1>this.freeTrialLength, "d");
        return this.isPaying 
        ? false
        : moment().isAfter(cutoffDate)
    }

}