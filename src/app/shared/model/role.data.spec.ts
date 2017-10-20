
import { Role } from "./role.data";

describe("role.data.ts", () => {

    beforeEach(() => {
    });

    describe("Serialization", () => {

        describe("deserialize", () => {
            it("should deserialize a valid input", () => {
                let input = JSON.parse("{\"description\": \"Some role\"}");
                let deserialized = new Role().deserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized.description).toBe("Some role");
            });

            it("should return undefined when deserializing an invalid input", () => {
                let input = JSON.parse("{\"notadescription\": \"Ahah\"}");
                let deserialized = new Role().deserialize(input);
                expect(deserialized).toBeUndefined();
            });
        });

        describe("tryDeserialize", () => {
            it("should return true when input is valid", () => {
                let input = JSON.parse("{\"description\": \"Some role\"}");
                let deserialized = new Role().tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(true);
                expect(deserialized[1]).toBeDefined();
            });

            it("should return false when input is invalid", () => {
                let input = JSON.parse("{\"notadescription\": \"John Doe\"}");
                let deserialized = new Role().tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });

            it("should return false when parsing fails", () => {
                let user = new Role();
                let input = JSON.parse("{}");
                spyOn(user, "deserialize").and.throwError("Cannot be parsed");
                let deserialized = user.tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });
        });
    });
});
