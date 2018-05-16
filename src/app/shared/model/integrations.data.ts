import { Serializable } from './../interfaces/serializable.interface';

export class SlackIntegration implements Serializable<SlackIntegration> {
    access_token: string;
    team_name: string;
    team_id: string;
    incoming_webhook: {
        url: string,
        channel: string,
        channel_id: string,
        configuration_url: string,
    }

    public constructor(init?: Partial<SlackIntegration>) {
        Object.assign(this, init);
    }

    static create(): SlackIntegration {
        return new SlackIntegration();
    }

    deserialize(input: any): SlackIntegration {
        let deserialized = new SlackIntegration();
        deserialized.access_token = input.access_token;
        deserialized.team_name = input.team_name;
        deserialized.team_id = input.team_id;
        deserialized.incoming_webhook = input.incoming_webhook;
        // console.log("deserialize slack", deserialized, input)
        return deserialized;
    }


    tryDeserialize(input: any): [boolean, SlackIntegration] {
        try {
            let slack = this.deserialize(input);
            if (slack !== undefined) {
                return [true, slack];
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