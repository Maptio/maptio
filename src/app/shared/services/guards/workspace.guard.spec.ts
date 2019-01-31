import { WorkspaceGuard } from "./workspace.guard";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { UIService } from "../ui/ui.service";
import { RouterStateSnapshot } from "@angular/router";
import { MarkdownService, MarkdownModule } from "ngx-markdown";
import { DeviceDetectorService } from "ngx-device-detector";

describe("workspace.guard.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DeviceDetectorService,
                UIService, WorkspaceGuard,  MarkdownService
            ],
            imports: [MarkdownModule]
        });

        localStorage.clear();
    })

    describe("canActivate", () => {
        it("should clean svg and return true", inject([WorkspaceGuard, UIService], (target: WorkspaceGuard, mockUIService: UIService) => {
            let route = jasmine.createSpyObj("route", [""]);
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", {url : "", toString: ""})

            spyOn(mockUIService, "clean")

            expect(target.canActivate(route, state)).toBe(true);
            expect(mockUIService.clean).toHaveBeenCalledTimes(1)
        }));

    });


});