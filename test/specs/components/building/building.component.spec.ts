import { ComponentFixture, TestBed, async, inject, fakeAsync } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BuildingComponent } from '../../../../app/components/building/building.component';
import { InitiativeComponent } from '../../../../app/components/initiative/initiative.component';
import { TreeComponent, TreeNode } from 'angular2-tree-component';
import { FocusIfDirective } from '../../../../app/directives/focusif.directive'
import { DataService } from '../../../../app/services/data.service'
import { ErrorService } from '../../../../app/services/error.service';
import { TreeExplorationService } from '../../../../app/services/tree.exploration.service'
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { InitiativeNode } from '../../../../app/model/initiative.data';
import { Person } from '../../../../app/model/person.data';

describe('building.component.ts', () => {

    let component: BuildingComponent;
    let target: ComponentFixture<BuildingComponent>;
    let nodes: Array<InitiativeNode>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            providers: [DataService, ErrorService, TreeExplorationService,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions],
            declarations: [BuildingComponent, TreeComponent, FocusIfDirective, InitiativeComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(BuildingComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    describe("View", () => {

        describe("Tree configuration", () => {
            it('should search tree on input', () => {
                let spy = spyOn(component, "filterNodes");
                let element = target.debugElement.query(By.css('#searchTreeInput')).nativeElement as HTMLInputElement;
                element.value = "some search";
                element.dispatchEvent(new Event('input'));
                expect(spy).toHaveBeenCalledWith('some search')
            });

            it("should send data to mapping component on tree update", () => {
                let spy = spyOn(component, "mapData");
                component.tree.treeModel.update();
                expect(spy).toHaveBeenCalled();
            });

            it("should bind tree nodes to component nodes", () => {
                let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                expect(component.tree.treeModel.nodes).toBe(component.nodes);
            });
        });

        describe("Tree display", () => {

            // it("should display the correct amount of nodes div", async(() => {
            //     let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();

            //     root.children = [node1, node2, node3];
            //     component.nodes = [root];
            //     component.tree.treeModel.nodes = [root];
            //     component.updateTreeModel();

            //     target.detectChanges();
            //     target.whenStable().then(() => {
            //         let rootNodeElements = target.debugElement.queryAll(By.css('.rootNode'));
            //         let regularNodeElements = target.debugElement.queryAll(By.css('.regularNode'));
            //         console.log(target.debugElement.nativeElement);
            //         //console.log(component.tree.treeModel);
            //         //console.log(target.debugElement.query(By.css('Tree')).nativeElement);
            //         expect(rootNodeElements.length).toBe(1);
            //         expect(regularNodeElements.length).toBe(3); 
            //     });


            // }));
        });


    });


    describe("Controller", () => {
        describe("Loading data", () => {
            it("shoud loads data and initializes tree", () => {
                let url = "http://getdata.com/data.json";

                fixture.load("test/specs/components/building/fixtures/data.json");
                let spyDataService = spyOn(DataService.prototype, "loadFromAsync").and.returnValue(Promise.resolve(fixture.json[0]));

                component.loadData(url);
                target.whenStable().then(() => {
                    expect(spyDataService).toHaveBeenCalledWith(url);
                    expect(component.nodes.length).toBe(1);
                });
            });

            it("should loads data and initializes team", () => {
                let url = "http://getdata.com/data.json";

                fixture.load("test/specs/components/building/fixtures/data.json");
                let spyDataService = spyOn(DataService.prototype, "loadFromAsync").and.returnValue(Promise.resolve(fixture.json[0]));

                component.loadData(url);
                target.whenStable().then(() => {
                    expect(spyDataService).toHaveBeenCalledWith(url);
                    expect(component.initiativeEditComponent.team.members.length).toBe(2);
                    expect(component.initiativeEditComponent.team.members.find(function (p) { return p.name == 'CTO' })).toBeDefined("Cant find CTO");
                    expect(component.initiativeEditComponent.team.members.find(function (p) { return p.name == 'CMO' })).toBeDefined("Cant find CMO");
                });
            });

            it("should loads data and initializes mapping component", () => {
                let url = "http://getdata.com/data.json";

                fixture.load("test/specs/components/building/fixtures/data.json");
                let spyDataService = spyOn(DataService.prototype, "loadFromAsync").and.returnValue(Promise.resolve(fixture.json[0]));
                let spyMapData = spyOn(component, "mapData");

                component.loadData(url);
                target.whenStable().then(() => {
                    expect(spyDataService).toHaveBeenCalledWith(url);
                    expect(spyMapData).toHaveBeenCalled();
                });
            });

        });

        describe("Mapping data", () => {
            it("should sends data to dataservice", () => {
                let node1 = new InitiativeNode(), node2 = new InitiativeNode();
                node1.name = 'first', node2.name = 'second';

                component.nodes = [node1, node2];
                let spy = spyOn(DataService.prototype, "setAsync");
                component.mapData();
                expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'first' }));

            });
        });

        describe("Filtering ", () => {

            it("should highlights all nodes when the search term is empty", () => {
                let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();
                node1.name = 'first', node2.name = 'second'; node3.name = 'third';
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spy = spyOn(component, "mapData");

                component.filterNodes('');
                expect(root.isSearchedFor).toBe(true);
                expect(node1.isSearchedFor).toBe(true);
                expect(node2.isSearchedFor).toBe(true);
                expect(node3.isSearchedFor).toBe(true);
                expect(spy).toHaveBeenCalled();
            });

            it("should highlight correct nodes when searching on name", () => {
                let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();
                node1.name = 'first', node2.name = 'second'; node3.name = 'second third';
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spy = spyOn(component, "mapData");

                component.filterNodes('second');
                expect(root.isSearchedFor).toBe(false);
                expect(node1.isSearchedFor).toBe(false);
                expect(node2.isSearchedFor).toBe(true);
                expect(node3.isSearchedFor).toBe(true);
                expect(spy).toHaveBeenCalled();
            });

            it("should hightlight correct nodes when searching on description", () => {
                let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();
                node1.name = 'first', node2.name = 'second'; node3.name = 'third';
                node1.description = 'primero', node2.description = 'segundo'; node3.description = 'segundo tercero';
                root.children = [node1, node2, node3];
                component.nodes = [root];
                target.detectChanges();
                let spy = spyOn(component, "mapData");

                component.filterNodes('segundo');
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

            describe("Add a node", () => {
                it("should add a child to given node", () => {
                    let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();
                    node1.id = 1, node2.id = 2; node3.id = 3;
                    node1.name = 'first', node2.name = 'second'; node3.name = 'third';
                    root.children = [node1, node2, node3];
                    component.nodes = [root];
                    target.detectChanges();

                    let treeNode = new TreeNode(node2, null, component.tree.treeModel);
                    let spyUpdate = spyOn(component, "updateTreeModel");
                    let spyGetNodeById = spyOn(component.tree.treeModel, "getNodeById").and.returnValue(treeNode);
                    let spyExpandNode = spyOn(component.tree.treeModel, "setExpandedNode");
                    component.addChildNode(node2);

                    expect(spyGetNodeById).toHaveBeenCalled();
                    expect(node2.children.length).toBe(1);
                    expect(node2.children[0].hasFocus).toBe(true);
                    expect(spyExpandNode).toHaveBeenCalledWith(treeNode, true);
                    expect(spyUpdate).toHaveBeenCalled();
                });
            });

            describe("Removes a node", () => {
                it("should remove given node from the tree", () => {
                    let root = new InitiativeNode(), node1 = new InitiativeNode(), node2 = new InitiativeNode(), node3 = new InitiativeNode();
                    node1.id = 1, node2.id = 2; node3.id = 3;
                    node1.name = 'first', node2.name = 'second'; node3.name = 'third';
                    root.children = [node1, node2, node3];
                    component.nodes = [root];
                    target.detectChanges();
                    let spyUpdate = spyOn(component, "updateTreeModel");

                    expect(root.children.length).toBe(3);
                    component.removeChildNode(node2);

                    expect(root.children.length).toBe(2);
                    expect(spyUpdate).toHaveBeenCalled();
                });
            });

            describe("Toggle", () => {
                it("should toggle the selected node", () => {
                    let toggledNode = new InitiativeNode();
                    toggledNode.id = 1;
                    let toggledTreeNode = new TreeNode(toggledNode, null, component.tree.treeModel);

                    let spyToggle = spyOn(toggledTreeNode, "toggleExpanded");
                    let spyGetNode = spyOn(component.tree.treeModel, "getNodeById").and.returnValue(toggledTreeNode);;

                    component.toggleNode(toggledNode);
                    expect(spyGetNode).toHaveBeenCalledWith(1);
                    expect(spyToggle).toHaveBeenCalled();
                });
            });

            describe("Open", () => {
                it("should open the selected node", () => {
                    let openedNode = new InitiativeNode();
                    openedNode.id = 1;
                    let spy = spyOn(component.initiativeEditComponent, "open");
                    component.openNode(openedNode);
                    expect(spy).toHaveBeenCalled();
                    expect(component.initiativeEditComponent.data).toBe(openedNode);
                });
            });

            describe("Zoom in", () => {
                it("should zoom on the selected node", () => {
                    let root = new InitiativeNode(), node1 = new InitiativeNode(), zoomedNode = new InitiativeNode();
                    node1.isZoomedOn = true; //previously zoomed on
                    root.children = [node1, zoomedNode];
                    component.nodes = [root];
                    let spyMapData = spyOn(component, "mapData");

                    component.zoomInNode(zoomedNode);

                    expect(zoomedNode.isZoomedOn).toBe(true);
                    expect(root.isZoomedOn).toBe(false);
                    expect(node1.isZoomedOn).toBe(false);
                    expect(spyMapData).toHaveBeenCalled();
                });
            });

            describe("Edit", () => {
                it("should save name of selected node", () => {
                    let node = new InitiativeNode();
                    node.name = "old"
                    let spyMapData = spyOn(component, "mapData");

                    component.saveNodeName("new", node);
                    expect(node.name).toBe("new");
                    expect(spyMapData).toHaveBeenCalled();
                });
            });

            describe("Validate", () => {
                it("should check that the root's name is valid", () => {
                    let root = new InitiativeNode();
                    component.nodes = [root];
                    expect(component.isRootValid()).toBe(false);
                });

                it("should check that the root's name is valid", () => {
                    let root = new InitiativeNode();
                    root.name = "anything"
                    component.nodes = [root];
                    expect(component.isRootValid()).toBe(true);
                });

                it("should check that the root's name is valid", () => {
                    let root = new InitiativeNode();
                    root.name = "     "
                    component.nodes = [root];
                    expect(component.isRootValid()).toBe(false);
                });
            });
        });
    });



    // it("should initialize tree component with nodes and update event", async(() => {
    //     let treeElement = target.debugElement.query(By.css('Tree'));
    //     expect(treeElement).toBeDefined();
    //     console.log((<TreeComponent>treeElement.componentInstance).nodes);
    //     console.log((<TreeComponent>treeElement.componentInstance).)
    // }));
    // }));

});
