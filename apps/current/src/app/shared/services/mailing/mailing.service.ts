import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

import {map} from 'rxjs/operators';

@Injectable()
export class MailingService {

    public client: any; // nodemailer.Transporter;

    constructor(private http: HttpClient) {}

    public sendInvitation(from: string, to: string[], url: string, team: string, invitedBy: string): Promise<boolean> {

        let email = {
            from: from,
            subject: `${invitedBy} invited you to join organisation "${team}" on Maptio`,
            url: url,
            to: to,
            team: team
        };

        return this.http.post("/api/v1/mail/invite", email).pipe(
            map((input: any) => {
                return input.MessageId !== undefined;
            }),)
            .toPromise()
    }

    public sendConfirmation(from: string, to: string[], url: string): Promise<boolean> {
        let email = {
            from: from,
            subject: `Maptio Account Confirmation`,
            url: url,
            to: to
        };

        // HTTPTODO:
        // return this.unsecureHttp.post("/api/v1/mail/confirm", email).pipe(
        return this.http.post("/api/v1/mail/confirm", email).pipe(
            map((input: any) => {
                return input.MessageId !== undefined;
            }),)
            .toPromise()
    }
}
