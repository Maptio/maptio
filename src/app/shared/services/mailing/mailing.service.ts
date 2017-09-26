import { AuthHttp } from "angular2-jwt";
import { Http } from "@angular/http";
import { Injectable } from "@angular/core";
import { ErrorService } from "../error/error.service";

@Injectable()
export class MailingService {

    public client: any; // nodemailer.Transporter;

    private _secureHttp: AuthHttp;
    private _unsecureHttp: Http;
    constructor(private secureHttp: AuthHttp, public unsecureHttp:Http, public errorService: ErrorService) {
        this._secureHttp = secureHttp;
        this._unsecureHttp = unsecureHttp;
    }

    // public sendEmail(from: string, to: string[], subject: string, body: string): Promise<boolean> {

    //     let email = {
    //         from: from,
    //         subject: subject,
    //         body: body,
    //         to: to
    //     };

    //     return this.http.post("/api/v1/send", email)
    //         .map((responseData) => {
    //             return responseData.json();
    //         })
    //         .map((input: any) => {
    //             return input.MessageId !== undefined;
    //         })
    //         .toPromise()
    //         .then(r => r)
    //         .catch(this.errorService.handleError);
    // }

    public sendInvitation(from: string, to: string[], url: string, team: string, invitedBy: string): Promise<boolean> {

        let email = {
            from: from,
            subject: `${invitedBy} invited to join team "${team}" on Maptio`,
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
            .then(r => r)
            .catch(this.errorService.handleError);
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
            .then(r => r)
            .catch(this.errorService.handleError);
    }
}