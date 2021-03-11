import { ShareSlackComponent } from "./slack.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA, SimpleChange } from "@angular/core";
import { Team } from "../../../../shared/model/team.data";
import { SlackIntegration } from "../../../../shared/model/integrations.data";

describe("slack.component.ts", () => {

    let component: ShareSlackComponent;
    let target: ComponentFixture<ShareSlackComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ShareSlackComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(ShareSlackComponent);
        component = target.componentInstance;
        // component.team = new Team({ team_id: "teamID", name: "My team" });
        // component.showConfiguration = true;
        // component.ngOnChanges({
        //     isPrinting: new SimpleChange(null, false, true),
        //     hasNotified: new SimpleChange(null, false, true),
        //     slack: new SimpleChange(null, new SlackIntegration({ access_token: "token" }), true),
        //     team: new SimpleChange(null, new Team({ team_id: "teamID", name: "My team" }), true)
        // })
    });

    describe("Sharing map", () => {
        it("should share map ", () => {
            spyOn(component.shareMap, "emit")
            component.sendNotification();
            expect(component.shareMap.emit).toHaveBeenCalled()
        });
    });

    describe("ngOnChanges", () => {
        it("should update template when printing ", () => {
            let spy = spyOn(component, "updateTemplate")
            component.ngOnChanges({ isPrinting: new SimpleChange(null, false, true) });
            expect(spy).toHaveBeenCalled();
        });

        it("should update template when notification sent ", () => {
            let spy = spyOn(component, "updateTemplate")
            component.ngOnChanges({ hasNotified: new SimpleChange(null, false, true) });
            expect(spy).toHaveBeenCalled();
        });

        it("should not update template when no changes to printing of notifications ", () => {
            let spy = spyOn(component, "updateTemplate")
            component.ngOnChanges({ team: new SimpleChange(null, new Team({}), true) });
            expect(spy).not.toHaveBeenCalled();
        });

        it("should show configuration screen if no slack object is present", () => {
            component.ngOnChanges({ team: new SimpleChange(null, new Team({}), true) });
            expect(component.showConfiguration).toBe(true)
        });

        it("should show configuration screen if slack object is present but with no access token", () => {
            component.ngOnChanges({ slackIntegration: new SimpleChange(null, new SlackIntegration({}), true) });
            expect(component.showConfiguration).toBe(true)
        });

        it("should not show configuration screen if slack object is present with access token", () => {
            component.ngOnChanges({ slackIntegration: new SimpleChange(null, new SlackIntegration({ access_token: "token" }), true) });
            expect(component.showConfiguration).toBe(false)
        });
    });
});
