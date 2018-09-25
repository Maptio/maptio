import { SharedModule } from './../../../shared/shared.module';
import { PermissionsDirective } from './../../../shared/directives/permission.directive';
import { Tag } from "./../../../shared/model/tag.data";
import { User } from "./../../../shared/model/user.data";
import { Role } from "./../../../shared/model/role.data";
import { Helper } from "./../../../shared/model/helper.data";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { ErrorService } from "./../../../shared/services/error/error.service";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { UserFactory } from "./../../../shared/services/user.factory";
import { TeamFactory } from "./../../../shared/services/team.factory";
import { Initiative } from "./../../../shared/model/initiative.data";
import { MarkdownModule } from "angular2-markdown";
import { AuthHttp } from "angular2-jwt";
import { RouterTestingModule } from "@angular/router/testing";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { InitiativeComponent } from "./initiative.component";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Observable";
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe("initiative.component.ts", () => {

    let component: InitiativeComponent;
    let target: ComponentFixture<InitiativeComponent>;
    let inputNode: Initiative;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, Ng2Bs3ModalModule, NgbModule.forRoot(), FormsModule, RouterTestingModule, MarkdownModule.forRoot()],
            declarations: [InitiativeComponent],
            providers: [TeamFactory, UserFactory, DatasetFactory,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                {
                    provide: Auth,
                    useClass: class {
                        getPermissions = jasmine.createSpy("getPermissions").and.returnValue([])
                        getUser = jasmine.createSpy("getUser").and.returnValue(Observable.of(new User({ user_id: "UID" })))
                    }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA],
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(InitiativeComponent);
        component = target.componentInstance;

        inputNode = {
            id: 1, name: "ORIGINAL", description: "ORIGINAL", children: [], helpers: [], start: new Date(2010, 1, 1),
            accountable: new Helper({ name: "ORIGINAL" }),
            hasFocus: false, isZoomedOn: false, team_id: "team_id", isSearchedFor: false, search: undefined, traverse: undefined, deserialize: undefined, tryDeserialize: undefined,
            getSlug: undefined, getParent: undefined, isDraggable: false, traversePromise: undefined, isExpanded: true, getRoles: undefined, tags: [], flatten: undefined, getAllParticipants :undefined
        };

        component.node = inputNode;

        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {
        describe("saveRole", () => {
            it("should save role", () => {
                let helper = new Helper({ name: "John Doe" })
                component.saveRole(helper, "some role");
                expect(helper.roles[0].description).toBe("some role")
            });

            it("should update role", () => {
                let helper = new Helper({ name: "John Doe", roles: [new Role({ description: "some role" })] })
                component.saveRole(helper, "some role update");
                expect(helper.roles[0].description).toBe("some role update")
            });
        });

        describe("saveHelper", () => {
            it("should save new helper when not present", () => {
                spyOn(component, "onBlur")
                component.node.helpers = []
                component.saveHelper({ item: new User({ name: "John Doe" }), preventDefault: null });
                expect(component.node.helpers.length).toBe(1);
                expect(component.node.helpers[0].name).toBe("John Doe");
                expect(component.node.helpers[0].roles).toEqual([]);
                expect(component.onBlur).toHaveBeenCalled();
            });

            it("should not save new helper when present", () => {
                spyOn(component, "onBlur")
                component.node.helpers = [new Helper({ name: "John Doe" })]
                component.saveHelper({ item: new User({ name: "John Doe" }), preventDefault: null });
                expect(component.node.helpers.length).toBe(1);
                expect(component.node.helpers[0].name).toBe("John Doe");
                expect(component.node.helpers[0].roles).toEqual([]);
                expect(component.onBlur).toHaveBeenCalled();
            });
        });

        describe("removeHelper", () => {
            it("should remove helper from list", () => {
                spyOn(component, "onBlur")
                component.node.helpers = [new Helper({ name: "John Doe", user_id: "1" }), new Helper({ name: "Jane Doe", user_id: "2" })]
                component.removeHelper(new Helper({ name: "John Doe", user_id: "1" }));
                expect(component.node.helpers.length).toBe(1);
                expect(component.node.helpers[0].name).toBe("Jane Doe");
                expect(component.node.helpers[0].roles).toEqual([]);
                expect(component.onBlur).toHaveBeenCalled();
            });
        });

        describe("saveName", () => {
            it("should save a new name", () => {
                expect(component.node.name).toBe("ORIGINAL");
                component.saveName("CHANGED");
                expect(component.node.name).toBe("CHANGED");
            });
        });

        describe("saveDescription", () => {
            it("should save a new description", () => {
                expect(component.node.description).toBe("ORIGINAL");
                component.saveDescription("CHANGED");
                expect(component.node.description).toBe("CHANGED");
            });
        });

        describe("saveAccountable", () => {
            it("should save accountable person when valid person is given", () => {
                expect(component.node.accountable).toBeDefined();
                expect(component.node.accountable.name).toBe("ORIGINAL");
                component.saveAccountable({ item: new Helper({ name: "John Doe" }), preventDefault: null });
                expect(component.node.accountable.name).toBe("John Doe");
                // expect(component.node.accountable.roles[0].description).toBe("")
            });
        });

        describe("removeAuthority", () => {
            it("should save accountable person when valid person is given", () => {
                component.node.accountable = new Helper({ name: "John" })
                component.removeAuthority();
                expect(component.node.accountable).toBeUndefined();
            });
        });

        describe("saveTag", () => {
            it("should save new tag when not present", () => {
                spyOn(component, "onBlur")
                component.node.tags = []
                component.saveTag({ item: new Tag({ shortid: "1", name: "NEW" }), preventDefault: null });
                expect(component.node.tags.length).toBe(1);
                expect(component.node.tags[0].shortid).toBe("1");
                expect(component.node.tags[0].name).toEqual("NEW");
                expect(component.onBlur).toHaveBeenCalled();
            });

            it("should not save new tag when present", () => {
                spyOn(component, "onBlur")
                component.node.tags = [new Tag({ shortid: "1", name: "NEW" })]
                component.saveHelper({ item: new Tag({ shortid: "1", name: "NEW" }), preventDefault: null });
                expect(component.node.helpers.length).toBe(1);
                expect(component.node.tags[0].shortid).toBe("1");
                expect(component.node.tags[0].name).toEqual("NEW");
                expect(component.onBlur).toHaveBeenCalled();
            });
        });

        describe("removeTag", () => {
            it("should remove tag from list", () => {
                spyOn(component, "onBlur")
                component.node.tags = [new Tag({ shortid: "1", name: "one" }), new Tag({ shortid: "2", name: "two" })]
                component.removeTag(new Tag({ shortid: "1", name: "one" }));
                expect(component.node.tags.length).toBe(1);
                expect(component.node.tags[0].shortid).toBe("2");
                expect(component.node.tags[0].name).toEqual("two");
                expect(component.onBlur).toHaveBeenCalled();
            });
        });

    });




});
