import { DataSet } from "./dataset.data";
const fixtures = require("./fixtures/dataset.json");

describe("Dataset Tests", () => {

    beforeEach(() => {
    });

    describe("Serialization", () => {

        describe("deserialize", () => {
            it("should deserialize a valid input", () => {
                let deserialized = new DataSet().deserialize(fixtures);

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
                let deserialized = new DataSet().tryDeserialize(fixtures);
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
