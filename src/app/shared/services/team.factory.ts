import { ErrorService } from "./error/error.service";
import { Team } from "./../model/team.data";
import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

@Injectable()
export class TeamFactory {

    private _http: Http;
    constructor(private http: Http, public errorService: ErrorService) {
        this._http = http;
    }

    /** Gets all teams
     *
     */
    // getAll(): Promise<Team[]> {
    //     return this.http.get("/api/v1/teams")
    //         .map((responseData) => {
    //             return responseData.json();
    //         })
    //         .map((inputs: Array<any>) => {
    //             let result: Array<Team> = [];
    //             if (inputs) {
    //                 inputs.forEach((input) => {
    //                     result.push(Team.create().deserialize(input));
    //                 });
    //             }
    //             return result;
    //         })
    //         .toPromise()
    //         .then(r => r)
    //         .catch(this.errorService.handleError);

    // }

    /** Gets a user using its uniquerId
     *  Returns undefined if no user is found
     */
    get(uniqueId: string): Promise<Team> {
        return this.http.get("/api/v1/team/" + uniqueId)
            .map((response: Response) => {
                return Team.create().deserialize(response.json());
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }

    /**
     * Creates a new team
     */
    create(input: Team): Promise<Team> {
        let transformed = {
            team_id: input.team_id,
            name: input.name,
            members: input.members.map(m => { return { name: m.name, picture: m.picture, user_id: m.user_id, nickname: m.nickname } })
        };

        return this.http.post("/api/v1/team", transformed)
            .map((responseData) => {
                return responseData.json();
            })
            .map((input: any) => {
                return Team.create().deserialize(input);
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }


    /**
     * Upsert a team
     * @param   team    User to update or insert
     * @returns         True if upsert has succeded, false otherwise
     */
    upsert(team: Team): Promise<boolean> {
        let transformed = {
                team_id: team.team_id,
                name: team.name,
                members: team.members.map(m => { return { name: m.name, picture: m.picture, user_id: m.user_id, nickname: m.nickname } })
            };
        return this.http.put("/api/v1/team/" + team.team_id, transformed)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true })
            .catch(this.errorService.handleError);
    }
}