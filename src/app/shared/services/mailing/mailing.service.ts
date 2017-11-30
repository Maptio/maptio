import { AuthHttp } from "angular2-jwt";
import { Http } from "@angular/http";
import { Injectable } from "@angular/core";

@Injectable()
export class MailingService {

    public client: any; // nodemailer.Transporter;

    constructor(private secureHttp: AuthHttp, private unsecureHttp: Http) {
    }

    public sendInvitation(from: string, to: string[], url: string, team: string, invitedBy: string): Promise<boolean> {

        let email = {
            from: from,
            subject: `${invitedBy} invited you to join team "${team}" on Maptio`,
            url: url,
            to: to,
            team: team
        };

        return this.secureHttp.post("/api/v1/mail/invite", email)
            .map((responseData) => {
                return responseData.json();
            })
            .map((input: any) => {
                return input.MessageId !== undefined;
            })
            .toPromise()
    }

    public sendConfirmation(from: string, to: string[], url: string): Promise<boolean> {
        // console.log("sen confirmation")
        let email = {
            from: from,
            subject: `Maptio Account Confirmation`,
            url: url,
            to: to
        };

        return this.unsecureHttp.post("/api/v1/mail/confirm", email)
            .map((responseData) => {
                return responseData.json();
            })
            .map((input: any) => {
                return input.MessageId !== undefined;
            })
            .toPromise()
    }
}