import { WorkspaceGuard } from "./workspace.guard";
import { TestBed, inject } from "@angular/core/testing";
import { RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { UIService } from "../../modules/workspace/services/ui.service";
import { WorkspaceModule } from "../../modules/workspace/workspace.module";
import { CoreModule } from "../core.module";
import { RouterTestingModule } from "@angular/router/testing";

describe("workspace.guard.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                
                {provide : ActivatedRouteSnapshot, useClass : class {}},
                {provide : RouterStateSnapshot, useClass : class {}},
            ],
            imports: [WorkspaceModule, CoreModule, RouterTestingModule]
        });

        localStorage.clear();
    })

    describe("canActivate", () => {
        it("should clean svg and return true", inject([WorkspaceGuard, UIService], (target: WorkspaceGuard, mockUIService: UIService) => {
           let route = TestBed.get(ActivatedRouteSnapshot);
      
            let state = TestBed.get(RouterStateSnapshot) ;
            
            spyOn(mockUIService, "clean")

            expect(target.canActivate(route, state)).toBe(true);
            expect(mockUIService.clean).toHaveBeenCalledTimes(1)
        }));

    });


});