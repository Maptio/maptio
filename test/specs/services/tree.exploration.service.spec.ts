import { ComponentFixture, TestBed, async, inject, fakeAsync } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TreeExplorationService } from '../../../app/services/tree.exploration.service';
import { ITreeNode } from '../../../app/interfaces/treenode.interface';

class Node implements ITreeNode {

    constructor(public id: number, public children: Array<ITreeNode>) { }

    public isCalledFor(someId: number) {
    }
}



describe('tree.exploration.service.ts', () => {

    let tree: Node;
    let node1: Node, node2: Node, node3: Node, node11: Node, node12: Node, node21: Node, node22: Node, node23: Node;

    node11 = new Node(11, []), node12 = new Node(12, []);
    node21 = new Node(21, []), node22 = new Node(22, []), node23 = new Node(23, []);
    node1 = new Node(1, [node11, node12]), node2 = new Node(2, [node21, node22, node23]), node3 = new Node(3, []);

    it("traverses one node when it has children", () => {
        tree = new Node(0, [node1, node2, node3]);

        let spy = spyOn(Node.prototype, "isCalledFor").and.callThrough();

        TreeExplorationService.traverseOne(tree, function (n: Node) { n.isCalledFor(n.id) });

        expect(spy).toHaveBeenCalledTimes(8)

        expect(spy).toHaveBeenCalledWith(1);
        expect(spy).toHaveBeenCalledWith(2);
        expect(spy).toHaveBeenCalledWith(3);
        expect(spy).toHaveBeenCalledWith(11);
        expect(spy).toHaveBeenCalledWith(12);
        expect(spy).toHaveBeenCalledWith(21);
        expect(spy).toHaveBeenCalledWith(22);
        expect(spy).toHaveBeenCalledWith(23);

    });

    it("traverses one node without children", () => {
        tree = new Node(0, []);
        let spy = spyOn(Node.prototype, "isCalledFor").and.callThrough();

        TreeExplorationService.traverseOne(tree, function (n: Node) { n.isCalledFor(n.id) });
        expect(spy).not.toHaveBeenCalled();
    });

     it("traverses multiple nodes", () => {
         let nodes = [node1, node2, node3];
        let spy = spyOn(Node.prototype, "isCalledFor").and.callThrough();

        TreeExplorationService.traverseAll(nodes, function (n: Node) { n.isCalledFor(n.id) });

         expect(spy).toHaveBeenCalledTimes(8)

        expect(spy).toHaveBeenCalledWith(1);
        expect(spy).toHaveBeenCalledWith(2);
        expect(spy).toHaveBeenCalledWith(3);
        expect(spy).toHaveBeenCalledWith(11);
        expect(spy).toHaveBeenCalledWith(12);
        expect(spy).toHaveBeenCalledWith(21);
        expect(spy).toHaveBeenCalledWith(22);
        expect(spy).toHaveBeenCalledWith(23);
    });




});