import { WorkspaceGuard } from "./workspace.guard";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { UIService } from "../ui/ui.service";
import { RouterStateSnapshot } from "@angular/router";
import { D3Service } from "d3-ng2-service";
import { MarkdownService, MarkdownModule } from "angular2-markdown";
import { DeviceDetectorService } from "ngx-device-detector";

describe("workspace.guard.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DeviceDetectorService,
                UIService, WorkspaceGuard, D3Service, MarkdownService
            ],
            imports: [MarkdownModule]
        });

        localStorage.clear();
    })

    describe("canActivate", () => {
        it("should clean svg and return true", inject([WorkspaceGuard, UIService], (target: WorkspaceGuard, mockUIService: UIService) => {
            let route = jasmine.createSpyObj("route", [""]);
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", []);

            spyOn(mockUIService, "clean")

            expect(target.canActivate(route, state)).toBe(true);
            expect(mockUIService.clean).toHaveBeenCalledTimes(1)
        }));

    });


});