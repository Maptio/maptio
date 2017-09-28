import { environment } from "./../../../../environment/environment";
import { Http, Headers } from "@angular/http";
import { Injectable } from "@angular/core";
import { AuthConfiguration } from "../auth/auth.config";
import { JwtEncoder } from "../encoding/jwt.service";
import { MailingService } from "../mailing/mailing.service";
import { UUID } from "angular2-uuid/index";
import { User } from "../../model/user.data";
import { EmitterService } from "../emitter.service";

@Injectable()
export class UserService {

    constructor(private http: Http, private configuration: AuthConfiguration, private encodingService: JwtEncoder, private mailing: MailingService) { }


    public sendInvite(email: string, userId: string, firstname: string, lastname: string, name: string, teamName: string, invitedBy: string): Promise<boolean> {

        return Promise.all([
            this.encodingService.encode({ user_id: userId, email: email, firstname: firstname, lastname: lastname, name: name }),
            this.configuration.getAccessToken()]
        ).then(([userToken, apiToken]: [string, string]) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + apiToken);
            return this.http.post(
                environment.TICKETS_API_URL,
                {
                    "result_url": "http://app.maptio.com/login?token=" + userToken,
                    "user_id": userId
                },
                { headers: headers })
                .map((responseData) => {
                    return <string>responseData.json().ticket;
                }).toPromise()
        })
            .then((ticket: string) => {
                return this.mailing.sendInvitation(environment.SUPPORT_EMAIL, [email], ticket, teamName, invitedBy)
            })
            .then((success: boolean) => {
                return this.updateInvitiationSentStatus(userId, true);
            });
    }

    public sendConfirmation(email: string, userId: string, firstname: string, lastname: string, name: string): Promise<boolean> {
        return Promise.all([
            this.encodingService.encode({ user_id: userId, email: email, firstname: firstname, lastname: lastname, name: name }),
            this.configuration.getAccessToken()]
        ).then(([userToken, apiToken]: [string, string]) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + apiToken);
            return this.http.post(
                environment.TICKETS_API_URL,
                {
                    "result_url": "http://app.maptio.com/login?token=" + userToken,
                    "user_id": userId
                },
                { headers: headers })
                .map((responseData) => {
                    return <string>responseData.json().ticket;
                }).toPromise()
        })
            .then((ticket: string) => {
                // console.log("sending ticket")
                return this.mailing.sendConfirmation(environment.SUPPORT_EMAIL, [email], ticket)
            })
            .then((success: boolean) => {
                return this.updateActivationPendingStatus(userId, true)
            });
    }

    public generateUserToken(userId: string, email: string, firstname: string, lastname: string): Promise<string> {
        return this.encodingService.encode({ user_id: userId, email: email, firstname: firstname, lastname: lastname })
    }

    public createUser(email: string, firstname: string, lastname: string, isSignUp?: boolean): Promise<User> {
        let newUser = {
            "connection": environment.CONNECTION_NAME,
            "email": email,
            "name": `${firstname} ${lastname}`,
            "password": `${UUID.UUID()}-${UUID.UUID().toUpperCase()}`,
            "email_verified": !isSignUp || true,
            "verify_email": false, // we are always sending our emails (not through Auth0)
            "app_metadata":
            {
                "activation_pending": true,
                "invitation_sent": false
            },
            "user_metadata":
            {
                "given_name": firstname,
                "family_name": lastname
            }
        }

        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.post(environment.USERS_API_URL, newUser, { headers: headers })
                .map((responseData) => {
                    return responseData.json();
                })
                .map((input: any) => {
                    return User.create().deserialize(input);
                })
                .toPromise()
        });
    }

    public isActivationPendingByUserId(user_id: string): Promise<boolean> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get(`${environment.USERS_API_URL}/` + user_id, { headers: headers })
                .map((responseData) => {
                    if (responseData.json().app_metadata) {
                        return responseData.json().app_metadata.activation_pending;
                    }
                    return false;
                })
                .toPromise()
        });
    }

    public isActivationPendingByEmail(email: string): Promise<{ isActivationPending: boolean, user_id: string }> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get(`${environment.USERS_API_URL}?include_totals=true&q=` + encodeURIComponent(`email="${email}"`), { headers: headers })
                .map((responseData) => {
                    if (responseData.json().total === 0) {
                        return { isActivationPending: false, user_id: undefined }
                    }
                    if (responseData.json().total === 1) {
                        let user = responseData.json().users[0];
                        return (user.app_metadata)
                            ? { isActivationPending: user.app_metadata.activation_pending, user_id: user.user_id }
                            : { isActivationPending: false, user_id: user.user_id }
                    }
                    return Promise.reject("There is more than one user with this email")
                })
                .toPromise()
        });
    }

    public isInvitationSent(user_id: string): Promise<boolean> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get(`${environment.USERS_API_URL}/${user_id}`, { headers: headers })
                .map((responseData) => {
                    if (responseData.json().app_metadata) {
                        return responseData.json().app_metadata.invitation_sent;
                    }
                    return false;
                })
                .toPromise()
        });
    }

    public updateUserInformation(user_id: string, password: string, firstname: string, lastname: string): Promise<boolean> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.patch(`${environment.USERS_API_URL}/${user_id}`,
                {
                    "password": password,
                    "user_metadata":
                    {
                        "given_name": firstname,
                        "family_name": lastname
                    },
                    "connection": environment.CONNECTION_NAME
                }
                ,
                { headers: headers })
                .toPromise()
                .then((response) => {
                    return true
                })
        });
    }

    public updateActivationPendingStatus(user_id: string, isActivationPending: boolean): Promise<boolean> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.patch(`${environment.USERS_API_URL}/${user_id}`,
                { "app_metadata": { "activation_pending": isActivationPending } }
                ,
                { headers: headers })
                .toPromise()
                .then((response) => {
                    return true
                })
        });
    }

    public updateInvitiationSentStatus(user_id: string, isInvitationSent: boolean): Promise<boolean> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.patch(`${environment.USERS_API_URL}/${user_id}`,
                { "app_metadata": { "invitation_sent": isInvitationSent } }
                ,
                { headers: headers })
                .map((responseData) => {
                    return true;
                })
                .toPromise()
        });
    }

    // public storeProfile(user_id: string): Promise<void> {
    //     return this.lock.getAuth0ManagementToken().then((token: string) => {
    //         let headers = new Headers();
    //         headers.set("Authorization", "Bearer " + token);
    //         return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + user_id,
    //             { headers: headers })
    //             .map((responseData) => {
    //                 localStorage.setItem("profile", JSON.stringify(responseData.json()));
    //             })
    //             .toPromise()
    //             .then(r => r)
    //             .catch(this.errorService.handleError);
    //     });
    // }

    public changePassword(email: string): void {
        this.configuration.getWebAuth().changePassword({
            connection: environment.CONNECTION_NAME,
            email: email
        }, function (err, resp) {
            if (err) {
                EmitterService.get("changePasswordFeedbackMessage").emit(err.error)
            } else {
                EmitterService.get("changePasswordFeedbackMessage").emit(resp)
            }
        });
    }

    public isUserExist(email: string): Promise<boolean> {
        return this.configuration.getAccessToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get(`${environment.USERS_API_URL}?include_totals=true&q=` + encodeURIComponent(`email="${email}"`), { headers: headers })
                .map((responseData) => {
                    if (responseData.json().total) {
                        return responseData.json().total === 1
                    }
                    return false;
                })
                .toPromise()
        });
    }
}
