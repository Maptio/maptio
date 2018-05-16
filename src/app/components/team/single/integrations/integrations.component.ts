import { Permissions } from './../../../../shared/model/permission.data';
import { Http } from '@angular/http';
import { TeamFactory } from "./../../../../shared/services/team.factory";
import { SlackIntegration } from "./../../../../shared/model/integrations.data";
import { AuthHttp } from "angular2-jwt";
import { environment } from "./../../../../../environment/environment";
import { Team } from "./../../../../shared/model/team.data";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";

@Component({
    selector: "team-single-integrations",
    templateUrl: "./integrations.component.html",
    styleUrls: ["./integrations.component.css"]
})
export class TeamIntegrationsComponent implements OnInit {

    public REDIRECT_URL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    public SLACK_URL = `https://slack.com/oauth/authorize?scope=incoming-webhook&client_id=${environment.SLACK_CLIENT_ID}&redirect_uri=${this.REDIRECT_URL}`

    public KB_URL_INTEGRATIONS = environment.KB_URL_INTEGRATIONS;
    public team: Team;
    public isDisplayRevokedToken: boolean;
    public isDisplayWaitingForSlackSync: boolean;
    public Permissions = Permissions;

    constructor(private route: ActivatedRoute, private router: Router,
        private secureHttp: AuthHttp, private http: Http, private teamFactory: TeamFactory,
        private cd: ChangeDetectorRef) {
        // console.log(window.location)
    }
    ngOnInit() {
        this.route.parent.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                this.team = data.assets.team;
                // console.log(this.team)
            });

        this.route.queryParams.map(queryParams => {
            return queryParams["code"]
        })
            .filter(code => code !== undefined && code !== "")
            .flatMap(code => {
                this.isDisplayWaitingForSlackSync = true;
                this.cd.markForCheck();
                // console.log("code", code)
                return this.secureHttp.post("/api/v1/oauth/slack", {
                    code: code,
                    redirect_uri: this.REDIRECT_URL
                })
                    .map((responseData) => {
                        // console.log("responsedata", responseData)
                        return responseData.json();
                    })
            })
            .subscribe(slack => {
                // console.log(slack)
                if (slack.ok) {
                    this.updateTeam(slack.access_token, slack.incoming_webhook, slack.team_name, slack.team_id)
                        .then(team => {
                            this.isDisplayWaitingForSlackSync = false;
                            this.cd.markForCheck();
                        })
                }
                else {
                    // do nothing, its probably
                }
            }, err => { console.log(err) })
    }

    updateTeam(slackAccessToken: string, slackWebookDetails: any, slackTeamName: string, slackTeamId: string) {
        let updatedTeam = new Team({
            team_id: this.team.team_id,
            name: this.team.name,
            members: this.team.members,
            settings: { authority: this.team.settings.authority, helper: this.team.settings.helper },
            slack: new SlackIntegration({
                access_token: slackAccessToken,
                team_name: slackTeamName,
                team_id: slackTeamId,
                incoming_webhook: {
                    url: slackWebookDetails.url,
                    channel: slackWebookDetails.channel,
                    channel_id: slackWebookDetails.channel_id,
                    configuration_url: slackWebookDetails.configuration_url
                }
            })
        });

        return this.teamFactory.upsert(updatedTeam).then(result => {
            if (result) {
                this.team = updatedTeam;
                this.cd.markForCheck();
            } else {

            }
        })

    }

    revokeToken(token: string) {
        this.isDisplayWaitingForSlackSync = true;
        this.cd.markForCheck();
        return this.http.get(`https://slack.com/api/auth.revoke?token=${token}`)
            .map(response => response.json())
            .subscribe(response => {
                let updatedTeam = new Team({
                    team_id: this.team.team_id,
                    name: this.team.name,
                    members: this.team.members,
                    settings: { authority: this.team.settings.authority, helper: this.team.settings.helper },
                    slack: new SlackIntegration({})
                });

                return this.teamFactory.upsert(updatedTeam).then(result => {
                    this.team = updatedTeam;
                    this.isDisplayRevokedToken = true;
                    this.isDisplayWaitingForSlackSync = false;
                    this.cd.markForCheck();
                }
                )
            })
    }

}