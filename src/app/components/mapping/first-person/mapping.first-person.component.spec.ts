import { AuthConfiguration } from "./../../../shared/services/auth/auth.config";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { MappingFirstPersonComponent } from "./mapping.first-person.component";
import { Observable } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TooltipComponent } from "./../tooltip/tooltip.component";
import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../shared/services/ui/color.service";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { User } from "../../../shared/model/user.data";



export class AuthStub {
    public getUser() {
    }
}

describe("mapping.circles.component.ts", () => {

    let component: MappingFirstPersonComponent;
    let target: ComponentFixture<MappingFirstPersonComponent>;

    let GoodProfile: User = new User({
        user_id: "someId"
    });

    let BadProfile: User = new User({
        user_id: "some_other_id"
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Auth, useClass: AuthStub },
            ],
            declarations: [MappingFirstPersonComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingFirstPersonComponent);
        component = target.componentInstance;

        component.width = 1000;
        component.height = 1000;
        component.margin = 50;
        component.zoom$ = Observable.of(1);
        component.fontSize$ = Observable.of(12);

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/first-person/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("should get the correct list of authorities when the user has some authority", async(() => {
        let mockAuth = target.debugElement.injector.get(Auth);
        let spyGetUser = spyOn(mockAuth, "getUser").and.returnValue(Observable.of(GoodProfile))
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.draw(data);

        expect(spyGetUser).toHaveBeenCalledTimes(1);
        spyGetUser.calls.mostRecent().returnValue.toPromise().then((u: User) => {
            expect(component.authorities.length).toBe(2);
            expect(component.authorities[0].name).toBe("Tech")
            expect(component.authorities[1].name).toBe("Marketing")
        })
    }));

    it("should get the correct empty list of authorities when the user has no authority", async(() => {
        let mockAuth = target.debugElement.injector.get(Auth);
        let spyGetUser = spyOn(mockAuth, "getUser").and.returnValue(Observable.of(BadProfile))
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.draw(data);

        expect(spyGetUser).toHaveBeenCalledTimes(1);
        spyGetUser.calls.mostRecent().returnValue.toPromise().then((u: User) => {
            expect(component.authorities.length).toBe(0);
        })
    }));

    it("should get the correct list of helps when the user has some", async(() => {
        let mockAuth = target.debugElement.injector.get(Auth);
        let spyGetUser = spyOn(mockAuth, "getUser").and.returnValue(Observable.of(GoodProfile))
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.draw(data);

        expect(spyGetUser).toHaveBeenCalledTimes(1);
        spyGetUser.calls.mostRecent().returnValue.toPromise().then((u: User) => {
            expect(component.helps.length).toBe(1);
            expect(component.helps[0].name).toBe("Tech")
        })
    }));

     it("should get the correct empty list of helps when the user has none", async(() => {
        let mockAuth = target.debugElement.injector.get(Auth);
        let spyGetUser = spyOn(mockAuth, "getUser").and.returnValue(Observable.of(BadProfile))
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.draw(data);

        expect(spyGetUser).toHaveBeenCalledTimes(1);
        spyGetUser.calls.mostRecent().returnValue.toPromise().then((u: User) => {
            expect(component.helps.length).toBe(0);
        })
    }));



});