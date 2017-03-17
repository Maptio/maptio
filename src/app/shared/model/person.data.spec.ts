import { Person } from "./person.data";

describe("Person Tests", () => {

    beforeEach(() => {
    });

    describe("Serialization", () => {

        describe("deserialize", () => {
            it("should deserialize a valid input", () => {
                let input = JSON.parse("{\"name\": \"John Doe\"}");
                let deserialized = new Person().deserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized.name).toBe("John Doe");
            });

            it("should return undefined when deserializing an invalid input", () => {
                let input = JSON.parse("{\"notaname\": \"John Doe\"}");
                let deserialized = new Person().deserialize(input);
                expect(deserialized).toBeUndefined();
            });
        });

        describe("tryDeserialize", () => {
            it("should return true when input is valid", () => {
                let input = JSON.parse("{\"name\": \"John Doe\"}");
                let deserialized = new Person().tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(true);
                expect(deserialized[1]).toBeDefined();
                expect(deserialized[1].name).toBe("John Doe");
            });

            it("should return false when input is invalid", () => {
                let input = JSON.parse("{\"notaname\": \"John Doe\"}");
                let deserialized = new Person().tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });

            it("should return false when parsing fails", () => {
                let person = new Person();
                let input = JSON.parse("{}");
                spyOn(person, "deserialize").and.throwError("Cannot be parsed");
                let deserialized = person.tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });
        });
    });
});
