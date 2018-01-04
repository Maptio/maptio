import { DataSet } from "./dataset.data";

describe("Dataset Tests", () => {

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
                expect(deserialized.datasetId).toBe("uniqueId");
                expect(deserialized.initiative).toBeDefined();
                expect(deserialized.initiative.name).toBe("Root");
                expect(deserialized.initiative.helpers.length).toBe(1);
                expect(deserialized.initiative.children.length).toBe(2);
            });
        });
        describe("tryDeserialize", () => {
            it("should return true when input is valid", () => {
                fixture.load("dataset.json");
                let jsonString = fixture.json[0];
                let deserialized = new DataSet().tryDeserialize(jsonString);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(true);
                expect(deserialized[1]).toBeDefined();
            });

            it("should return false when input is invalid", () => {
                let deserialized = new DataSet().tryDeserialize("{}");
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });

            it("should return false when parsing fails", () => {
                let dataset = new DataSet();
                let input = JSON.parse("{}");
                spyOn(dataset, "deserialize").and.throwError("Cannot be parsed");
                let deserialized = dataset.tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });
        });


    });
});
