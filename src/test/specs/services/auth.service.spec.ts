import { User } from './../../../app/shared/model/user.data';
import { ErrorService } from './../../../app/shared/services/error.service';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { UserFactory } from './../../../app/shared/services/user.factory';
import { Auth } from "../../../app/shared/services/auth.service"
import { TestBed, async, inject, fakeAsync } from "@angular/core/testing";
import { tokenNotExpired } from "angular2-jwt";


describe("auth.service.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                Auth, UserFactory, {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService
            ]
        });
    });


    describe("setUser", () => {
        it("should store profile in local storage and database when profile is valid", inject([Auth], (auth: Auth) => {
            expect(localStorage.getItem("profile")).toBe(null);
            let profile = { user_id: "some unique id" };

            let spyUpsert = spyOn(auth.userFactory, "upsert");
            auth.setUser(profile);

            expect(localStorage.getItem("profile")).toBeDefined();
            expect(spyUpsert).toHaveBeenCalledWith(jasmine.any(User));
            expect(spyUpsert).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "some unique id" }));
        }));

        it("should make user available for later user  when profile is valid", async(inject([Auth], (auth: Auth) => {
            let profile = { user_id: "some unique id" };

            let spyUpsert = spyOn(auth.userFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "resolved" })));
            auth.setUser(profile);

            expect(spyUpsert).toHaveBeenCalledWith("some unique id");
            spyUpsert.calls.mostRecent().returnValue.then(() => {
                auth.getUser().toPromise().then(() => {
                    // FIXME  : should check that user$ is set but how ? 
                })
            });
        })));

        it("should throw when user is invalid", inject([Auth], (auth: Auth) => {
            let profile = { not_an_id: "some unique id" };
            expect(function () { auth.setUser(profile) }).toThrowError();
        }));
    });

    describe("login", () => {
        it("should show authentication screen", inject([Auth], (auth: Auth) => {
            let mockLock = jasmine.createSpyObj("mockLock", ["show"]);
            spyOn(auth, "getLock").and.returnValue(mockLock);
            auth.login();
            expect(mockLock.show).toHaveBeenCalled();
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