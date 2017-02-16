import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Initiative } from '../../../app/model/initiative.data';

describe('initiative.data.ts', () => {



    beforeEach(() => {
    });

    it('Leaves description undefined at creation', () => {
        let target = new Initiative();
        expect(target.description).toBeUndefined();
    });

    describe("Traverse", () => {

        let tree: Initiative;
        let node1: Initiative, node2: Initiative, node3: Initiative, node11: Initiative, node12: Initiative, node21: Initiative, node22: Initiative, node23: Initiative;

        node11 = new Initiative(), node12 = new Initiative();
        node11.id = 11, node12.id = 12;
        node21 = new Initiative(), node22 = new Initiative(), node23 = new Initiative();
        node21.id = 21, node22.id = 22, node23.id = 23;
        node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
        node1.id = 1, node1.children = [node11, node12];
        node2.id = 2, node2.children = [node21, node22, node23];
        node3.id = 3;

        it("traverses one node when it has children", () => {
            tree = new Initiative();
            tree.children = [node1, node2, node3];
            tree.id= 0;

            let doSomethingSpy = jasmine.createSpy("doSomethingSpy");
            tree.traverse(function (n: Initiative) { doSomethingSpy(n.id) });

            expect(doSomethingSpy.calls.count()).toBe(8);

            expect(doSomethingSpy).toHaveBeenCalledWith(1);
            expect(doSomethingSpy).toHaveBeenCalledWith(2);
            expect(doSomethingSpy).toHaveBeenCalledWith(3);
            expect(doSomethingSpy).toHaveBeenCalledWith(11);
            expect(doSomethingSpy).toHaveBeenCalledWith(12);
            expect(doSomethingSpy).toHaveBeenCalledWith(21);
            expect(doSomethingSpy).toHaveBeenCalledWith(22);
            expect(doSomethingSpy).toHaveBeenCalledWith(23);

        });

        it("traverses one node without children", () => {
            tree = new Initiative();
            let doSomethingSpy = jasmine.createSpy("doSomethingSpy");
            tree.traverse(function (n: Initiative) { doSomethingSpy(n.id) });
            expect(doSomethingSpy).not.toHaveBeenCalled();
        });
    });
});
