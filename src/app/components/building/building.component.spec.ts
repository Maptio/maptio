
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
import { TreeComponent, TreeDraggedElement } from "angular2-tree-component";
import { FocusIfDirective } from "../..//shared/directives/focusif.directive"
import { ErrorService } from "../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { InitiativeComponent } from "../initiative/initiative.component";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { Auth } from "../../shared/services/auth/auth.service";

export class AuthStub {

}

describe("building.component.ts", () => {

    let component: BuildingComponent;
    let target: ComponentFixture<BuildingComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [Ng2Bs3ModalModule, NgbModule.forRoot()],
            declarations: [BuildingComponent, TreeComponent, FocusIfDirective, InitiativeComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(BuildingComponent, {
            set: {
                providers: [DataService, ErrorService, TeamFactory, DatasetFactory, TreeDraggedElement,
                    NgbModal,
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

    describe("View", () => {

        describe("Tree configuration", () => {
            it("should search tree on input", () => {
                let spy = spyOn(component, "filterNodes");
                let element = target.debugElement.query(By.css("#searchTreeInput")).nativeElement as HTMLInputElement;
                element.value = "some search";
                element.dispatchEvent(new Event("input"));
                expect(spy).toHaveBeenCalledWith("some search")
            });

            it("should send data to mapping component on tree update", () => {
                let spy = spyOn(component, "saveChanges");
                component.tree.treeModel.update();
                expect(spy).toHaveBeenCalled();
            });

            it("should bind tree nodes to component nodes", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                expect(component.tree.treeModel.nodes).toBe(component.nodes);
            });
        });

        describe("Tree display", () => {

            it("should display one node matching the correct data", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                root.children = [node1, node2, node3];
                component.nodes = [root];

                target.detectChanges();
                let treeNode = target.debugElement.queryAll(By.css("Tree treenode"));
                expect(treeNode.length).toBe(1); // one and only one root
                let dataNode = <Initiative>treeNode[0].context.$implicit.data;
                expect(dataNode).toBe(root);
            });
        });

        describe("updateData event", () => {

            it("should call mapData", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                root.children = [node1, node2, node3];
                component.nodes = [root];
                let spyMapData = spyOn(component, "saveChanges");

                target.detectChanges();

                let element = target.debugElement.query(By.css("Tree treenode")).nativeElement as HTMLElement;
                element.dispatchEvent(new CustomEvent("map"));

                expect(spyMapData).toHaveBeenCalled();

            });
        });

        describe("updateTree event", () => {
            xit("should call updateTreeModel", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spyMapData = spyOn(component, "updateTreeModel").and.callThrough();

                target.detectChanges();

                let element = target.debugElement.query(By.css("Tree treenode"));
                element.triggerEventHandler("update", null);

                expect(spyMapData).toHaveBeenCalled();
            });
        });

        // describe("openSelected event", () => {
        //     xit("should call editInitiative", () => {
        //         let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
        //         root.children = [node1, node2, node3];
        //         component.nodes = [root];
        //         let spyEdit = spyOn(component, "editInitiative");

        //         target.detectChanges();

        //         let element = target.debugElement.query(By.css("Tree treenode")).nativeElement as HTMLElement;
        //         element.dispatchEvent(new Event("openSelected"));

        //         expect(spyEdit).toHaveBeenCalled();
        //     });
        // });

        describe("Save button", () => {
            xit("should call saveChanges when clicked", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                root.children = [node1, node2, node3];
                component.nodes = [root];
                let spy = spyOn(component, "saveChanges");
                target.detectChanges();
                let button = target.debugElement.query(By.css("a#saveButton")).nativeElement as HTMLButtonElement;
                button.dispatchEvent(new Event("click"));
                expect(spy).toHaveBeenCalled();
            });
        });


    });


    describe("Controller", () => {

        // describe("Edit initiative", () => {
        //     it("should open initiative modal", () => {
        //         let mockModalService = target.debugElement.injector.get(NgbModal);
        //         let node = new Initiative(), parent = new Initiative();
        //         let spyGetParent = spyOn(node, "getParent").and.returnValue(parent)
        //         let spyModalOpen = spyOn(mockModalService, "open")
        //         component.editInitiative(node);
        //         expect(component.openedNode).toBe(node);
        //         expect(component.openedNodeParent).toBe(parent);
        //         expect(spyGetParent).toHaveBeenCalled();
        //         expect(spyModalOpen).toHaveBeenCalled();
        //     })
        // });

        describe("Loading data", () => {
            it("shoud loads data and initializes tree", async(() => {
                let mockDataService = target.debugElement.injector.get(DatasetFactory);

                fixture.load("data.json");
                let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(fixture.json[0]));

                component.loadData("someId");
                spyDataService.calls.mostRecent().returnValue.then(() => {
                    expect(spyDataService).toHaveBeenCalledWith("someId");
                    expect(component.nodes.length).toBe(1);
                });
            }));

            it("should loads data and initializes team_id for each node", async(() => {
                let mockDataService = target.debugElement.injector.get(DatasetFactory);

                fixture.load("data.json");
                let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(fixture.json[0]));

                component.loadData("someId");
                expect(spyDataService).toHaveBeenCalledWith("someId");

                spyDataService.calls.mostRecent().returnValue.then((data: any) => {
                    expect(component.nodes[0].team_id).toBe("ID1");
                    expect(component.nodes[0].children.find(n => n.name === "Tech").team_id).toBe("ID1");
                    expect(component.nodes[0].children.find(n => n.name === "Marketing").team_id).toBe("ID1");
                    expect(component.nodes[0].children.find(n => n.name === "The rest").team_id).toBe("ID1");
                });
            }));

            it("should loads data and initializes mapping component", async(() => {
                let mockDataService = target.debugElement.injector.get(DatasetFactory);


                fixture.load("data.json");
                let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(fixture.json[0]));
                let spyMapData = spyOn(component, "saveChanges");

                component.loadData("someId");
                spyDataService.calls.mostRecent().returnValue.then(() => {
                    expect(spyDataService).toHaveBeenCalledWith("someId");
                    expect(spyMapData).toHaveBeenCalled();
                });
            }));

            // it("should load data and open a node with matching slug", async(() => {
            //     let mockDataService = target.debugElement.injector.get(DatasetFactory);

            //     fixture.load("data.json");
            //     let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(fixture.json[0]));
            //     let spyMapData = spyOn(component, "saveChanges");
            //     let spyEdit = spyOn(component, "editInitiative")
            //     component.loadData("someId", "the-rest");
            //     spyDataService.calls.mostRecent().returnValue.then(() => {
            //         expect(spyDataService).toHaveBeenCalledWith("someId");
            //         expect(spyMapData).toHaveBeenCalled();
            //         expect(spyEdit).toHaveBeenCalledWith(jasmine.objectContaining({ name: "The rest" }));
            //     });

            // }))

        });

        describe("Filtering ", () => {

            it("should highlights all nodes when the search term is empty", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                node1.name = "first", node2.name = "second"; node3.name = "third";
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spy = spyOn(component, "saveChanges");

                component.filterNodes("");
                expect(root.isSearchedFor).toBe(true);
                expect(node1.isSearchedFor).toBe(true);
                expect(node2.isSearchedFor).toBe(true);
                expect(node3.isSearchedFor).toBe(true);
                expect(spy).toHaveBeenCalled();
            });

            it("should highlight correct nodes when searching on name", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                node1.name = "first", node2.name = "second"; node3.name = "second third";
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spy = spyOn(component, "saveChanges");

                component.filterNodes("second");
                expect(root.isSearchedFor).toBe(false);
                expect(node1.isSearchedFor).toBe(false);
                expect(node2.isSearchedFor).toBe(true);
                expect(node3.isSearchedFor).toBe(true);
                expect(spy).toHaveBeenCalled();
            });

            it("should hightlight correct nodes when searching on description", () => {
                let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
                node1.name = "first", node2.name = "second"; node3.name = "third";
                node1.description = "primero", node2.description = "segundo"; node3.description = "segundo tercero";
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spy = spyOn(component, "saveChanges");

                component.filterNodes("segundo");
                expect(root.isSearchedFor).toBe(false);
                expect(node1.isSearchedFor).toBe(false);
                expect(node2.isSearchedFor).toBe(true);
                expect(node3.isSearchedFor).toBe(true);
                expect(spy).toHaveBeenCalled();
            });
        });

        describe("Tree manipulation", () => {
            describe("Update", () => {
                it("should update tree component", () => {
                    let spy = spyOn(component.tree.treeModel, "update");
                    component.updateTreeModel();
                    expect(spy).toHaveBeenCalled();
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

                it("should sends data to dataservice", async(() => {
                    let mockDataService = target.debugElement.injector.get(DataService);

                    let node1 = new Initiative(), node2 = new Initiative();
                    node1.name = "first", node2.name = "second";

                    component.nodes = [node1, node2];
                    component.datasetId = "some_id"
                    let spy = spyOn(mockDataService, "set");
                    component.saveChanges();
                    expect(spy).toHaveBeenCalledWith({ initiative: jasmine.objectContaining({ name: "first" }), datasetId: "some_id" });

                }));
            });
        });
    });


});
