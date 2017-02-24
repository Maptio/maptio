import { Auth } from "../../../app/shared/services/auth.service"
import { TestBed, async, inject, fakeAsync } from "@angular/core/testing";

describe("auth.service.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                Auth
            ]
        });
    });

    xit("should check something here", ()=>{
        expect(true).toBe(false);
    });

})