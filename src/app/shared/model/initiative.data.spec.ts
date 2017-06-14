
import { Initiative } from "./initiative.data";

describe("initiative.data.ts", () => {

    let tree: Initiative;
    let node1: Initiative, node2: Initiative, node3: Initiative, node11: Initiative, node12: Initiative, node21: Initiative, node22: Initiative, node23: Initiative;

    beforeAll(() => {
        fixture.setBase("src/app/shared/model/fixtures");
    })

    afterEach(() => {
        fixture.cleanup();
    })

    beforeEach(() => {


        node11 = new Initiative(), node12 = new Initiative();
        node11.id = 11, node12.id = 12;
        node21 = new Initiative(), node22 = new Initiative(), node23 = new Initiative();
        node21.id = 21, node22.id = 22, node23.id = 23;
        node1 = new Initiative(), node2 = new Initiative(), node3 = new Initiative();
        node1.id = 1, node1.children = [node11, node12];
        node2.id = 2, node2.children = [node21, node22, node23];
        node3.id = 3;

    });

    it("Leaves description undefined at creation", () => {
        let target = new Initiative();
        expect(target.description).toBeUndefined();
    });

    describe("Serialization", () => {

        describe("deserialize", () => {
            it("should return valid initiative when input is valid", () => {

                fixture.load("serialize.json");
                let jsonString = fixture.json[0];
                let initiative = new Initiative().deserialize(jsonString);

                expect(initiative).toBeDefined();
                expect(initiative.name).toBe("Root");
                expect(initiative.accountable).toBeUndefined();
                expect(initiative.description).toBe("Something");
                expect(initiative.children.length).toBe(2);
                expect(initiative.helpers.length).toBe(1)
                expect(initiative.helpers[0].user_id).toBe("helper_id");
                expect(initiative.helpers[0].name).toBe("Helper")

                expect(initiative.children[0]).toBeDefined();
                expect(initiative.children[0].name).toBe("Tech");
                expect(initiative.children[0].accountable.name).toBe("CTO");
                expect(initiative.children[0].description).toBeUndefined();
                expect(initiative.children[0].children).toBeUndefined();

                expect(initiative.children[1]).toBeDefined();
                expect(initiative.children[1].name).toBe("The rest");
                expect(initiative.children[1].accountable).toBeUndefined();
                expect(initiative.children[1].description).toBeUndefined();
                expect(initiative.children[1].children).toBeUndefined();
            });
        });

        describe("tryDeserialize", () => {
            it("should throw error when calling tryDeserialize", () => {
                expect(function () {
                    new Initiative().tryDeserialize("");
                }).toThrowError();
            });
        });
    });


    describe("Traverse", () => {
        it("traverses one node when it has children", () => {
            tree = new Initiative();
            tree.children = [node1, node2, node3];
            tree.id = 0;

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


    describe("getParent", () => {
        it("should return the parent of node when node is not root", () => {
            tree = new Initiative();
            tree.children = [node1, node2, node3];
            tree.id = 0;

            expect(node1.getParent(tree)).toBe(tree);
            expect(node2.getParent(tree)).toBe(tree);
            expect(node3.getParent(tree)).toBe(tree);
            expect(node11.getParent(tree)).toBe(node1);
            expect(node12.getParent(tree)).toBe(node1);
            expect(node21.getParent(tree)).toBe(node2);
            expect(node22.getParent(tree)).toBe(node2);
            expect(node23.getParent(tree)).toBe(node2);
        })

         it("should return undefined when node is root", () => {
            tree = new Initiative();
            tree.children = [node1, node2, node3];
            tree.id = 0;

            expect(tree.getParent(tree)).toBe(undefined);
        })

    })
});
