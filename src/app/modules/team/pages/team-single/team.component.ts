import { DataSet } from '../../../../shared/model/dataset.data';
import { Permissions } from "../../../../shared/model/permission.data";
import { ActivatedRoute } from "@angular/router";
import { Team } from "../../../../shared/model/team.data";
import { Subscription } from "rxjs/Rx";
import { OnInit } from "@angular/core";
import { Component, ChangeDetectorRef } from "@angular/core";
import { EmitterService } from '../../../../core/services/emitter.service';


@Component({
    selector: "team",
    templateUrl: "./team.component.html",
    styleUrls: ["./team.component.css"]
})
export class TeamComponent implements OnInit {
    routeSubscription: Subscription;

    team: Team;
    Permissions = Permissions;
    // isOnboardingAddMembers: boolean;
    // isOnboardingAddMap: boolean;
    // isOnboardingAddTerminology: boolean;
    // isOnboarding: boolean;
    constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.routeSubscription = this.route.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                this.team = data.assets.team;
                EmitterService.get("currentTeam").emit(this.team);
                this.cd.markForCheck();
            });
        // this.isOnboardingAddMembers = this.route.snapshot.queryParamMap.has("onboarding") && this.route.snapshot.queryParamMap.get("onboarding") === "members";
        // this.isOnboardingAddMap = this.route.snapshot.queryParamMap.has("onboarding") && this.route.snapshot.queryParamMap.get("onboarding") === "map";
        // this.isOnboardingAddTerminology = this.route.snapshot.queryParamMap.has("onboarding") && this.route.snapshot.queryParamMap.get("onboarding") === "settings";
        // this.isOnboarding = this.isOnboardingAddMap || this.isOnboardingAddMembers || this.isOnboardingAddTerminology;
    }

    ngOnDestroy() { 
        EmitterService.get("currentTeam").emit(null);
                
        this.routeSubscription.unsubscribe();
    }



}

