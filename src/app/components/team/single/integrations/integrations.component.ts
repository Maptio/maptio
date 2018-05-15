import { TeamFactory } from './../../../../shared/services/team.factory';
import { SlackIntegration } from './../../../../shared/model/integrations.data';
import { AuthHttp } from 'angular2-jwt';
import { environment } from './../../../../../environment/environment';
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

    public REDIRECT_URL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`; // "http://localhost:3000/api/v1/oauth/slack";
    public SLACK_URL = `https://slack.com/oauth/authorize?scope=chat:write:user,channels:read&client_id=${environment.SLACK_CLIENT_ID}&redirect_uri=${this.REDIRECT_URL}`

    private team: Team;

    constructor(private route: ActivatedRoute, private router: Router,
        private http: AuthHttp, private teamFactory: TeamFactory,
        private cd: ChangeDetectorRef) {
        // console.log(window.location)
    }
    ngOnInit() {
        this.route.parent.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                this.team = data.assets.team;
                console.log(this.team)
            });

        this.route.queryParams.map(queryParams => {
            return queryParams["code"]
        })
            .filter(code => code !== undefined && code !== "")
            .flatMap(code => {
                console.log("code", code)
                return this.http.post("/api/v1/oauth/slack", {
                    code: code,
                    redirect_uri: this.REDIRECT_URL
                })
                    .map((responseData) => {
                        console.log("responsedata", responseData)
                        return responseData.json();
                    })
            })
            .subscribe(slack => {
                console.log(slack)
                if (slack.ok) {
                    this.updateTeam(slack.access_token, slack.incoming_webhook).then(team => {

                    })
                }
                else {

                }
            })
    }

    updateTeam(slackAccessToken: string, slackWebookDetails: any) {
        let updatedTeam = new Team({
            team_id: this.team.team_id,
            name: this.team.name,
            members: this.team.members,
            settings: { authority: this.team.settings.authority, helper: this.team.settings.helper },
            slack: new SlackIntegration({
                access_token: slackAccessToken,
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

}