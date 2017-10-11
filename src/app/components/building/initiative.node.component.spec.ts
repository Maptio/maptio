import { NgbModule, NgbTooltipConfig } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Rx";
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from "@angular/router";
import { TreeModel, TreeNode } from "angular-tree-component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { Initiative } from "../../shared/model/initiative.data";
import { InitiativeNodeComponent } from "./initiative.node.component";
import { FocusIfDirective } from "../../shared/directives/focusif.directive";

describe("initiative.node.component.ts", () => {

    let component: InitiativeNodeComponent;
    let target: ComponentFixture<InitiativeNodeComponent>;
    // let nodes: Array<InitiativeNode>;
    let root = new Initiative(), node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
    let tree: TreeModel;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, NgbModule],
            declarations: [InitiativeNodeComponent, FocusIfDirective],
            providers: [{ provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
            {
                provide: ActivatedRouteSnapshot
            },
            {
                provide: ActivatedRoute,
                useValue: {
                    params: Observable.of({ mapid: 123, slug: "slug" })
                }
            },
            NgbTooltipConfig
            ]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(InitiativeNodeComponent);
        component = target.componentInstance;

        root.id = -1, node1.id = 1, node2.id = 2; node3.id = 3;
        node1.name = "first", node2.name = "second"; node3.name = "third";
        root.name = "root";
        root.children = [node1, node2, node3];
        node1.children = [];
        node2.children = [];
        node3.children = []

        tree = new TreeModel(null);
        tree.nodes = [root];
        component.node = new TreeNode(root, tree.getTreeNode(root, undefined), tree);

        target.detectChanges(); // trigger initial data binding
    });

    describe("View", () => {
        it("should display the correct buttons for the root node", () => {
            let spyIsRoot = spyOn(component, "isRoot").and.returnValue(true);
            target.detectChanges();
            // console.log(target.debugElement.nativeElement);
            // expect(target.debugElement.query(By.css("label")).nativeElement.innerHTML).toBe("Project");
            // expect(target.debugElement.queryAll(By.css("a.toggle.open-node")).length).toBe(1);
            // expect(target.debugElement.queryAll(By.css("input.inputNodeName")).length).toBe(1);
            expect(target.debugElement.queryAll(By.css("a.add")).length).toBe(1);
            expect(target.debugElement.queryAll(By.css("a.remove")).length).toBe(0);
            expect(target.debugElement.queryAll(By.css("a.edit")).length).toBe(0);
            // expect(target.debugElement.queryAll(By.css("a.zoom")).length).toBe(0);

            expect(spyIsRoot).toHaveBeenCalled();
        });

        it("should display the correct buttons for the regular node", () => {
            let spyIsRoot = spyOn(component, "isRoot").and.returnValue(false);
            target.detectChanges();
            // console.log(target.debugElement.nativeElement);
            // expect(target.debugElement.queryAll(By.css("a.toggle.open-node")).length).toBe(1);
            // expect(target.debugElement.queryAll(By.css("input.inputNodeName")).length).toBe(1);
            expect(target.debugElement.queryAll(By.css("a.add")).length).toBe(1);
            expect(target.debugElement.queryAll(By.css("a.remove")).length).toBe(1);
            expect(target.debugElement.queryAll(By.css("a.edit")).length).toBe(1);
            // expect(target.debugElement.queryAll(By.css("a.zoom")).length).toBe(1);

            expect(spyIsRoot).toHaveBeenCalled();
        });

        xdescribe("Toggling", () => {
            it("should display hide button when node is expanded", () => {
                let spyHasChildren = spyOn(component, "hasChildren").and.returnValue(true);
                let spyIsExpanded = spyOn(component, "isExpanded").and.returnValue(true);
                target.detectChanges();

                expect(target.debugElement.queryAll(By.css("a.toggle.close-node")).length).toBe(1);
                expect(target.debugElement.queryAll(By.css("a.toggle.open-node")).length).toBe(0);
                expect(spyHasChildren).toHaveBeenCalled();
                expect(spyIsExpanded).toHaveBeenCalled();
            });

            it("should display expand button when node is hidden", () => {
                let spyHasChildren = spyOn(component, "hasChildren").and.returnValue(true);
                let spyIsExpanded = spyOn(component, "isExpanded").and.returnValue(false);
                target.detectChanges();

                expect(target.debugElement.queryAll(By.css("a.toggle.close-node")).length).toBe(0);
                expect(target.debugElement.queryAll(By.css("a.toggle.open-node")).length).toBe(1);
                expect(spyHasChildren).toHaveBeenCalled();
                expect(spyIsExpanded).toHaveBeenCalled();
            });

            it("should disable toggle buttons when node does not have children", () => {
                let spyHasChildren = spyOn(component, "hasChildren").and.returnValue(false);
                target.detectChanges();

                expect(target.debugElement.queryAll(By.css("a.toggleHideLink")).length).toBe(0);
                expect(target.debugElement.queryAll(By.css("a.toggleExpandLink")).length).toBe(0);
                expect(spyHasChildren).toHaveBeenCalled();
            });


        });


        describe("Name", () => {
            it("should save name when changed on input", () => {
                let spySaveName = spyOn(component, "saveNodeName");
                let inputElement = target.debugElement.query(By.css(".inputNodeName")).nativeElement as HTMLInputElement;
                expect(inputElement).toBeDefined();

                inputElement.value = "new name";
                inputElement.dispatchEvent(new Event("input"));
                target.detectChanges();

                expect(inputElement.value).toBe("new name");
                expect(spySaveName).toHaveBeenCalledWith("new name", component.node.data);
            });
        });

        describe("Add button", () => {
            it("should add node when clicked", () => {
                let spyAdd = spyOn(component, "addChildNode");
                let button = target.debugElement.query(By.css(".add")).nativeElement as HTMLAnchorElement;

                button.dispatchEvent(new Event("click"));
                target.detectChanges();

                expect(spyAdd).toHaveBeenCalledWith(component.node.data);
            });
        });


        describe("Remove button", () => {
            it("should remove node when clicked", () => {
                let spyRemove = spyOn(component, "removeChildNode");
                let button = target.debugElement.query(By.css(".remove")).nativeElement as HTMLAnchorElement;

                button.dispatchEvent(new Event("confirm"));
                target.detectChanges();

                expect(spyRemove).toHaveBeenCalledWith(component.node.data);
            });
        });

        // describe("Open button", () => {
        //     it("should open node when clicked", () => {
        //         let spyOpen = spyOn(component, "openNode");
        //         let button = target.debugElement.query(By.css(".edit")).nativeElement as HTMLAnchorElement;

        //         button.dispatchEvent(new Event("click"));
        //         target.detectChanges();

        //         expect(spyOpen).toHaveBeenCalledWith(component.node.data);
        //     });
        // });

        // describe("Zoom in button", () => {
        //     it("should zoom in node when clicked", () => {
        //         let spyZoomIn = spyOn(component, "zoomInNode");
        //         let button = target.debugElement.query(By.css(".zoom")).nativeElement as HTMLAnchorElement;

        //         button.dispatchEvent(new Event("click"));
        //         target.detectChanges();

        //         expect(spyZoomIn).toHaveBeenCalledWith(component.node.data);
        //     });
        // });
    });

    describe("Controller", () => {

        describe("Tree manipulation", () => {

            describe("hasChildren", () => {
                it("should return true for root node", () => {
                    component.node = new TreeNode(root, tree.getTreeNode(root, undefined), tree);
                    expect(component.hasChildren()).toBe(true);
                });

                it("should return false for regular node", () => {
                    component.node = new TreeNode(node1, tree.getTreeNode(root, undefined), tree);
                    expect(component.hasChildren()).toBe(false);
                });
            });

            describe("isExpanded", () => {
                it("should return true after it is expanded", () => {
                    component.node.setIsExpanded(true);
                    expect(component.isExpanded()).toBe(true);
                });

                it("should return false after it is collapsed", () => {
                    component.node.setIsExpanded(false);
                    expect(component.isExpanded()).toBe(false);
                });
            });

            describe("Add a node", () => {
                it("should add a child to given node", () => {
                    let treeNode = new TreeNode(node2, component.node, tree);
                    let spyUpdate = spyOn(component.updateTreeEvent, "emit");
                    let spyGetNodeById = spyOn(component.node.treeModel, "getNodeById").and.returnValue(treeNode);
                    let spyExpandNode = spyOn(component.node.treeModel, "setExpandedNode");
                    component.addChildNode(node2);

                    expect(spyGetNodeById).toHaveBeenCalled();
                    expect(node2.children.length).toBe(1);
                    expect(node2.children[0].hasFocus).toBe(true);
                    expect(spyExpandNode).toHaveBeenCalledWith(treeNode, true);
                    expect(spyUpdate).toHaveBeenCalledWith(component.node.treeModel);
                });

                it("should add a child to given node in first position", () => {

                    let treeNode = new TreeNode(node2, component.node, tree);
                    let spyUpdate = spyOn(component.updateTreeEvent, "emit");
                    let spyGetNodeById = spyOn(component.node.treeModel, "getNodeById").and.returnValue(treeNode);
                    let spyExpandNode = spyOn(component.node.treeModel, "setExpandedNode");
                    // add first child
                    component.addChildNode(node2);
                    node2.children[0].name = "First";

                    // add second child
                    component.addChildNode(node2);

                    expect(spyGetNodeById).toHaveBeenCalled();
                    expect(node2.children.length).toBe(2);
                    expect(node2.children[0].hasFocus).toBe(true);
                    expect(spyExpandNode).toHaveBeenCalledWith(treeNode, true);
                    expect(spyUpdate).toHaveBeenCalledWith(component.node.treeModel);

                    // checks order
                    expect(node2.children[0].name).toBeUndefined();
                    expect(node2.children[1].name).toBe("First");
                });
            });

            describe("Removes a node", () => {
                it("should remove given node from the tree", () => {
                    let treeNode = new TreeNode(node2, component.node, tree);
                    let spyUpdate = spyOn(component.updateTreeEvent, "emit");
                    let spyGetNodeById = spyOn(component.node.treeModel, "getNodeById").and.returnValue(treeNode);

                    expect(root.children.length).toBe(3);
                    component.removeChildNode(node2);

                    expect(root.children.length).toBe(2);
                    expect(spyGetNodeById).toHaveBeenCalled();
                    expect(spyUpdate).toHaveBeenCalledWith(component.node.treeModel);
                });
            });

            describe("Toggle", () => {
                it("should toggle the selected node", () => {
                    let toggledNode = new Initiative();
                    toggledNode.id = 1;
                    let toggledTreeNode = new TreeNode(toggledNode, component.node, component.node.treeModel);

                    let spyToggle = spyOn(toggledTreeNode, "toggleExpanded");
                    let spyGetNode = spyOn(component.node.treeModel, "getNodeById").and.returnValue(toggledTreeNode);

                    component.toggleNode(toggledNode);
                    expect(spyGetNode).toHaveBeenCalledWith(1);
                    expect(spyToggle).toHaveBeenCalled();
                });
            });

            // describe("Open", () => {
            //     it("should open the selected node when another node is already opened", () => {
            //         let openInitiativeEvent = new Initiative();
            //         openInitiativeEvent.id = 1;
            //         openInitiativeEvent.name = "something";
            //         let mockRouter = target.debugElement.injector.get(Router);
            //         let spyGetSlug = spyOn(openInitiativeEvent, "getSlug").and.returnValue("slug")
            //         component.datasetId = "DID"
            //         component.openNode(openInitiativeEvent);
            //         expect(mockRouter.navigate).toHaveBeenCalledWith(["map", component.datasetId, "i", "slug"]);
            //         expect(spyGetSlug).toHaveBeenCalled();
            //     });
            // });

            // describe("Zoom in", () => {
            //     it("should zoom on the selected node", () => {
            //         node1.isZoomedOn = true;
            //         root.isZoomedOn = true;

            //         let spyUpdate = spyOn(component.edited, "emit");

            //         component.zoomInNode(node2);

            //         expect(node2.isZoomedOn).toBe(true);
            //         expect(root.isZoomedOn).toBe(false);
            //         expect(node1.isZoomedOn).toBe(false);
            //         expect(spyUpdate).toHaveBeenCalledWith(true);
            //     });
            // });

            describe("Edit", () => {
                it("should save name of selected node", () => {
                    let node = new Initiative();
                    node.name = "old"
                    let spyUpdate = spyOn(component.edited, "emit");

                    component.saveNodeName("new", node);
                    expect(node.name).toBe("new");
                    expect(spyUpdate).toHaveBeenCalledWith(true);
                });
            });
        });

    });
});
