import { Auth } from "../../../app/shared/services/auth.service"
import { TestBed, async, inject, fakeAsync } from "@angular/core/testing";
import { tokenNotExpired } from "angular2-jwt";

describe("auth.service.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                Auth
            ]
        });
    });

    describe("login", () => {
        it("should show authentication screen", inject([Auth], (auth: Auth) => {
            let spy = spyOn(auth.lock, "show");
            auth.login();
            expect(spy).toHaveBeenCalled();
        }));
    });

    describe("logout", () => {
        it("should clean remove profile and toek from localStorage", inject([Auth], (auth: Auth) => {
            localStorage.setItem("profile", "some profile information");
            localStorage.setItem("id_token", "some token");
            expect(localStorage.getItem("profile")).toBeDefined();
            expect(localStorage.getItem("id_token")).toBeDefined();
            auth.logout();
            expect(localStorage.getItem("profile")).toBe(null)
            expect(localStorage.getItem("id_token")).toBe(null);
        }));

        it("should set userProfile to undefined", inject([Auth], (auth: Auth) => {
            let spy = spyOn(auth, "clear");
            auth.logout();
            expect(spy).toHaveBeenCalled();
        }));
    });
});