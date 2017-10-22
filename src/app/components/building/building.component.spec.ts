import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs/Rx";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { AuthHttp } from "angular2-jwt";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataService } from "./../../shared/services/data.service";
import { Initiative } from "./../../shared/model/initiative.data";
import { TeamFactory } from "./../../shared/services/team.factory";
import { EmitterService } from "./../../shared/services/emitter.service";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA, EventEmitter } from "@angular/core"
import { By } from "@angular/platform-browser";
import { BuildingComponent } from "./building.component";
import { TreeComponent, TreeDraggedElement, TreeModule, TreeModel } from "angular-tree-component";
import { FocusIfDirective } from "../..//shared/directives/focusif.directive"
import { ErrorService } from "../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { InitiativeComponent } from "../initiative/initiative.component";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { Auth } from "../../shared/services/auth/auth.service";
import { Router, NavigationStart } from "@angular/router";
import { UserFactory } from "../../shared/services/user.factory";
import { User } from "../../shared/model/user.data";

export class AuthStub {

}

export class TreeComponentStub extends TreeComponent {

}

describe("building.component.ts", () => {

    let component: BuildingComponent;
    let target: ComponentFixture<BuildingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [Ng2Bs3ModalModule, NgbModule.forRoot(), RouterTestingModule],
            declarations: [BuildingComponent, FocusIfDirective, InitiativeComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(BuildingComponent, {
            set: {
                providers: [DataService, ErrorService, TeamFactory, DatasetFactory, UserFactory, TreeDraggedElement, Angulartics2Mixpanel,
                    Angulartics2, NgbModal,
                    { provide: Auth, useClass: AuthStub },
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    {
                        provide: AuthHttp,
                        useFactory: authHttpServiceFactoryTesting,
                        deps: [Http, BaseRequestOptions]
                    },
                    {
                        provide: Router, useClass: class {
                            navigate = jasmine.createSpy("navigate");
                            events = Observable.of(new NavigationStart(0, "/next"))
                        }
                    },

                    MockBackend,
                    BaseRequestOptions]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(BuildingComponent);
        component = target.componentInstance;
        target.detectChanges(); // trigger initial data binding
    });


    beforeAll(() => {
        fixture.setBase("src/app/components/building/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    })


    describe("Loading data", () => {
        it("shoud loads data,  initializes tree and saveChanges", async(() => {
            let mockDataService = target.debugElement.injector.get(DatasetFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            fixture.load("data.json");

            let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(fixture.json[0]));
            spyOn(mockUserFactory, "get").and.callFake((user_id: string) => {
                return Promise.resolve(new User({ picture: `URL${user_id}`, name: `Name${user_id}` }))
            })
            spyOn(component, "saveChanges");
            spyOn(component.openDetailsEditOnly, "emit");

            component.loadData("someId").then(() => {
                expect(spyDataService).toHaveBeenCalledWith("someId");
                spyDataService.calls.mostRecent().returnValue
                    .then(() => {
                        expect(component.nodes.length).toBe(1);
                        expect(component.nodes[0].team_id).toBe("ID1");
                        expect(component.nodes[0].children[0].team_id).toBe("ID1");
                        expect(component.nodes[0].children[1].team_id).toBe("ID1");
                        expect(component.nodes[0].children[2].team_id).toBe("ID1")
                    })
                    .then(() => {
                        expect(component.nodes[0].children[0].accountable.picture).toBe("URL1");
                        expect(component.nodes[0].children[1].accountable.picture).toBe("URL2");
                        expect(component.nodes[0].children[2].accountable).toBeUndefined()
                        expect(component.nodes[0].children[0].accountable.name).toBe("Name1");
                        expect(component.nodes[0].children[1].accountable.name).toBe("Name2");
                        expect(component.nodes[0].children[2].accountable).toBeUndefined()
                    })
                    .then((queue: any) => {
                        expect(component.saveChanges).toHaveBeenCalled();
                    })
                    .then(() => {
                        expect(component.openDetailsEditOnly.emit).not.toHaveBeenCalled();
                    });
            });

        }));

        it("shoud loads data,  initializes tree,  saveChanges and open node if provided", async(() => {
            let mockDataService = target.debugElement.injector.get(DatasetFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            fixture.load("data.json");

            let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(fixture.json[0]));
            spyOn(mockUserFactory, "get").and.callFake((user_id: string) => {
                return Promise.resolve(new User({ picture: `URL${user_id}`, name: `Name${user_id}` }))
            })
            spyOn(component, "saveChanges");
            spyOn(component.openDetailsEditOnly, "emit")
            component.loadData("someId", "2").then(() => {
                expect(spyDataService).toHaveBeenCalledWith("someId");
                spyDataService.calls.mostRecent().returnValue
                    .then(() => {
                        expect(component.nodes.length).toBe(1);
                        expect(component.nodes[0].team_id).toBe("ID1");
                        expect(component.nodes[0].children[0].team_id).toBe("ID1");
                        expect(component.nodes[0].children[1].team_id).toBe("ID1");
                        expect(component.nodes[0].children[2].team_id).toBe("ID1")
                    })
                    .then(() => {
                        expect(component.nodes[0].children[0].accountable.picture).toBe("URL1");
                        expect(component.nodes[0].children[1].accountable.picture).toBe("URL2");
                        expect(component.nodes[0].children[2].accountable).toBeUndefined()
                        expect(component.nodes[0].children[0].accountable.name).toBe("Name1");
                        expect(component.nodes[0].children[1].accountable.name).toBe("Name2");
                        expect(component.nodes[0].children[2].accountable).toBeUndefined()
                    })
                    .then((queue: any) => {
                        expect(component.saveChanges).toHaveBeenCalled();
                    })
                    .then(() => {
                        expect(component.openDetailsEditOnly.emit).toHaveBeenCalledWith(jasmine.objectContaining({ id: "2", name: "Marketing" }))
                    })
            });

        }));
    });

    describe("Filtering ", () => {

        it("should calls correct dependencies when search term is  empty", () => {
            let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
            node1.name = "first", node2.name = "second"; node3.name = "third";
            root.children = [node1, node2, node3];
            component.nodes = [root];
            target.detectChanges();
            let spy = spyOn(component, "saveChanges");
            let treeModel = jasmine.createSpyObj<TreeModel>("treeModel", ["clearFilter"])
            component.filterNodes(treeModel, "");
            expect(root.isSearchedFor).toBe(false);
            expect(node1.isSearchedFor).toBe(false);
            expect(node2.isSearchedFor).toBe(false);
            expect(node3.isSearchedFor).toBe(false);
            expect(spy).toHaveBeenCalled();
        });

        it("should calls correct dependencies when search term is not empty", () => {
            let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
            node1.name = "first", node2.name = "second"; node3.name = "third";
            node1.description = "primero", node2.description = "segundo"; node3.description = "segundo tercero";
            root.children = [node1, node2, node3];
            component.nodes = [root];
            target.detectChanges();
            let spy = spyOn(component, "saveChanges");
            let treeModel = jasmine.createSpyObj<TreeModel>("treeModel", ["filterNodes"]);

            component.filterNodes(treeModel, "segundo");
            expect(treeModel.filterNodes).toHaveBeenCalled();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe("Tree manipulation", () => {
        describe("Update", () => {
            it("should update tree component", () => {
                let treeModel = jasmine.createSpyObj<TreeModel>("treeModel", ["update"])
                component.updateTreeModel(treeModel);
                expect(treeModel.update).toHaveBeenCalled();
            });
        });

        describe("Validate", () => {
            it("should check that the root's name is valid", () => {
                let root = new Initiative();
                component.nodes = [root];
                expect(component.isRootValid()).toBe(false);
            });

            it("should check that the root's name is valid", () => {
                let root = new Initiative();
                root.name = "anything"
                component.nodes = [root];
                expect(component.isRootValid()).toBe(true);
            });

            it("should check that the root's name is valid", () => {
                let root = new Initiative();
                root.name = "     "
                component.nodes = [root];
                expect(component.isRootValid()).toBe(false);
            });
        });
    });

    describe("Save changes", () => {
        describe("saveChanges", () => {
            it("should emit data to save", () => {
                let spyEmit = spyOn(component.save, "emit")
                let root = new Initiative();
                component.nodes = [root];
                component.saveChanges();
                expect(spyEmit).toHaveBeenCalledWith(root);
            });

            // it("should sends data to dataservice", async(() => {
            //     let mockDataService = target.debugElement.injector.get(DataService);

            //     let node1 = new Initiative(), node2 = new Initiative();
            //     node1.name = "first", node2.name = "second";

            //     component.nodes = [node1, node2];
            //     component.datasetId = "some_id"
            //     let spy = spyOn(mockDataService, "set");
            //     component.saveChanges();
            //     expect(spy).toHaveBeenCalledWith({ initiative: jasmine.objectContaining({ name: "first" }), datasetId: "some_id" });

            // }));
        });
    });

    describe("Open Details", () => {
        it("should emit selected node", () => {
            let spy = spyOn(component.openDetails, "emit");
            let newNode = new Initiative({ name: "newly updated" });
            component.openNodeDetails(newNode)
            expect(spy).toHaveBeenCalledWith(newNode)
        });
    });


});
