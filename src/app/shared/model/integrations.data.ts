import { Serializable } from './../interfaces/serializable.interface';

export class SlackIntegration implements Serializable<SlackIntegration> {
    access_token: string;
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
        if (!input._id) {
            return undefined;
        }

        let deserialized = new SlackIntegration();
        deserialized.access_token = input.access_token;
        deserialized.incoming_webhook = input.incoming_webhook;

        return deserialized;
    }


    tryDeserialize(input: any): [boolean, SlackIntegration] {
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