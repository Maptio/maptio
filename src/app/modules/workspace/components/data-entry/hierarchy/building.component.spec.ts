import { AnalyticsModule } from '../../../../../core/analytics.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '../../../../../core/authentication/auth.service';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactoryTesting } from '../../../../../core/mocks/authhttp.helper.shared';
import { BaseRequestOptions, Http } from '@angular/http';
import { BuildingComponent } from './building.component';
import { CoreModule } from '../../../../../core/core.module';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { DatasetFactory } from '../../../../../core/http/map/dataset.factory';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { InitiativeComponent } from '../details/initiative.component';
import { LoaderService } from '../../../../../shared/components/loading/loader.service';
import { MockBackend } from '@angular/http/testing';
import { NavigationStart } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../../../shared/shared.module';
import { Team } from '../../../../../shared/model/team.data';
import { TreeComponent, TreeModel } from 'angular-tree-component';
import { User } from '../../../../../shared/model/user.data';
import { UserService } from '../../../../../shared/services/user/user.service';
import { NO_ERRORS_SCHEMA, } from "@angular/core"
import { WorkspaceModule } from '../../../workspace.module';
const fixtures = require("./fixtures/data.json");


export class TreeComponentStub extends TreeComponent {

}

describe("building.component.ts", () => {

    let component: BuildingComponent;
    let target: ComponentFixture<BuildingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, AnalyticsModule, CoreModule, SharedModule, WorkspaceModule],
            declarations: [],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(BuildingComponent, {
            set: {
                providers: [
                    {
                        provide: LoaderService,
                        useClass: class {
                            hide = jest.fn()
                            show = jest.fn()
                        },
                        deps: [NgProgress]
                    },
                    {
                        provide: Auth,
                        useClass: class {
                            getPermissions = jest.fn().mockReturnValue([])
                            getUser = jest.fn().mockReturnValue(Observable.of(new User({ user_id: "UID" })))
                        }
                    },
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
                            navigate = jest.fn();
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



    describe("Loading data", () => {
        xit("shoud loads data,  initializes tree and saveChanges", async(() => {
            let mockDataService = target.debugElement.injector.get(DatasetFactory);
            let mockUserFactory = target.debugElement.injector.get(UserService);

            let initiative = new Initiative().deserialize(fixtures);
            let dataset = new DataSet({ datasetId: "someId", initiative: initiative })
            let team = new Team({
                team_id: "ID1", members: [
                    new User({ picture: `URL1`, name: `Name1`, user_id: "1" }),
                    new User({ picture: `URL2`, name: `Name2`, user_id: "2" }),
                    new User({ picture: `URL3`, name: `Name3`, user_id: "3" })
                ]
            })
            let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(dataset));
            spyOn(mockUserFactory, "getUsersInfo").and.callFake((user_ids: string[]) => {
                return Promise.resolve([
                    new User({ picture: `URL1`, name: `Name1`, user_id: "1" }),
                    new User({ picture: `URL2`, name: `Name2`, user_id: "2" }),
                    new User({ picture: `URL3`, name: `Name3`, user_id: "3" })
                ])
            });
            spyOn(component, "saveChanges");
            spyOn(component.openDetailsEditOnly, "emit");

            component.loadData(dataset, team, team.members).then(() => {
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
                        expect(component.saveChanges).not.toHaveBeenCalled();
                    })
                    .then(() => {
                        expect(component.openDetailsEditOnly.emit).not.toHaveBeenCalled();
                    });
            });

        }));

        xit("shoud loads data,  initializes tree,  saveChanges and open node if provided", async(() => {
            let mockDataService = target.debugElement.injector.get(DatasetFactory);
            let mockUserFactory = target.debugElement.injector.get(UserService);

            let initiative = new Initiative().deserialize(fixtures);
            let dataset = new DataSet({ datasetId: "someId", initiative: initiative })
            let team = new Team({
                team_id: "ID1", members: [
                    new User({ picture: `URL1`, name: `Name1`, user_id: "1" }),
                    new User({ picture: `URL2`, name: `Name2`, user_id: "2" }),
                    new User({ picture: `URL3`, name: `Name3`, user_id: "3" })
                ]
            })
            let spyDataService = spyOn(mockDataService, "get").and.returnValue(Promise.resolve(dataset));
            spyOn(mockUserFactory, "getUsersInfo").and.callFake((user_ids: string[]) => {
                return Promise.resolve([
                    new User({ picture: `URL1`, name: `Name1`, user_id: "1" }),
                    new User({ picture: `URL2`, name: `Name2`, user_id: "2" }),
                    new User({ picture: `URL3`, name: `Name3`, user_id: "3" })
                ])
            });
            spyOn(component, "saveChanges");
            spyOn(component.openDetailsEditOnly, "emit")
            component.loadData(dataset, team, team.members).then(() => {
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
                        expect(component.saveChanges).not.toHaveBeenCalled();
                    })
            });

        }));
    });

    describe("Tree manipulation", () => {
        describe("Update", () => {
            it("should update tree component", () => {
                let treeModel= {
                    update: jest.fn()
                }
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
                expect(spyEmit).toHaveBeenCalledWith({ initiative: root, tags: component.tags });
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

    describe("Remove node", () => {
        it("should remove from root node", () => {
            let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();

            root.id = -1, node1.id = 1, node2.id = 2; node3.id = 3;
            node1.name = "first", node2.name = "second"; node3.name = "third";
            root.name = "root";
            root.children = [node1, node2, node3];
            node1.children = [];
            node2.children = [];
            node3.children = []
            component.nodes = [root];

            spyOn(component, "saveChanges");
            spyOn(component, "updateTree")
            component.removeNode(node2);
            expect(component.nodes[0].children.length).toBe(2);
            expect(component.saveChanges).not.toHaveBeenCalled();
            expect(component.updateTree).toHaveBeenCalledTimes(1);
        });

        it("should remove from children nodes", () => {
            let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();

            root.id = -1, node1.id = 1, node2.id = 2; node3.id = 3;
            node1.name = "first", node2.name = "second"; node3.name = "third";
            root.name = "root";
            root.children = [node1];
            node1.children = [node2, node3];
            node2.children = [];
            node3.children = []
            component.nodes = [root];

            spyOn(component, "saveChanges");
            spyOn(component, "updateTree")
            component.removeNode(node3);

            expect(component.nodes[0].children.length).toBe(1);
            expect(component.nodes[0].children[0].children.length).toBe(1);
            expect(component.saveChanges).not.toHaveBeenCalled();
            expect(component.updateTree).toHaveBeenCalledTimes(1);
        });
    });

    describe("Add node", () => {
        it("should add to root node in first place", () => {
            let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();

            root.id = -1, node1.id = 1, node2.id = 2; node3.id = 3;
            node1.name = "first", node2.name = "second"; node3.name = "third";
            root.name = "root";
            root.team_id = "team_id"
            root.children = [node1, node2, node3];
            node1.children = [];
            node2.children = [];
            node3.children = []
            component.nodes = [root];

            spyOn(component, "saveChanges");
            spyOn(component, "updateTree")
            component.addNodeTo(root, new Initiative({ name: "NEW" }));

            expect(component.nodes[0].children.length).toBe(4);
            expect(component.nodes[0].children[0].id).toBeDefined();
            expect(component.nodes[0].children[0].name).toBe("NEW");
            expect(component.nodes[0].children[0].team_id).toBe("team_id")
            expect(component.nodes[0].children[0].children).toBeDefined();
            expect(component.saveChanges).not.toHaveBeenCalled();
            expect(component.updateTree).toHaveBeenCalledTimes(1);
        });

        it("should add to children nodes in first place", () => {
            let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();

            root.id = -1, node1.id = 1, node2.id = 2; node3.id = 3;
            node1.name = "first", node2.name = "second"; node3.name = "third";
            root.name = "root";
            node1.team_id = "team_id"
            root.children = [node1];
            node1.children = [node2, node3];
            node2.children = [];
            node3.children = []
            component.nodes = [root];

            spyOn(component, "saveChanges");
            spyOn(component, "updateTree")
            component.addNodeTo(node1, new Initiative({ name: "NEW" }));

            expect(component.nodes[0].children.length).toBe(1);
            expect(component.nodes[0].children[0].children.length).toBe(3);
            expect(component.nodes[0].children[0].children[0].id).toBeDefined();
            expect(component.nodes[0].children[0].children[0].team_id).toBe("team_id")
            expect(component.nodes[0].children[0].children[0].children).toBeDefined();
            expect(component.nodes[0].children[0].children[0].name).toBe("NEW");
            expect(component.saveChanges).not.toHaveBeenCalled();
            expect(component.updateTree).toHaveBeenCalledTimes(1);
        });
    });
});
