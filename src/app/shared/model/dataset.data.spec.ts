import { DataSet } from "./dataset.data";

describe("Dataset Tests", () => {
    let dataset: DataSet;

    let NAME: string = "name";

    beforeEach(() => {
    });


    beforeAll(() => {
        fixture.setBase("src/app/shared/model/fixtures");
    })

    afterEach(() => {
        fixture.cleanup();
    })

    describe("Serialization", () => {

        describe("deserialize", () => {
            it("should deserialize a valid input", () => {
                 fixture.load("dataset.json");
                let jsonString = fixture.json[0];
                let deserialized = new DataSet().deserialize(jsonString);

                expect(deserialized).toBeDefined();
                expect(deserialized._id).toBe("uniqueId");
                expect(deserialized.initiative).toBeDefined();
                expect(deserialized.initiative.name).toBe("Root");
                expect(deserialized.initiative.helpers.length).toBe(1);
                expect(deserialized.initiative.children.length).toBe(2);
            });
        });

        
    });
});
