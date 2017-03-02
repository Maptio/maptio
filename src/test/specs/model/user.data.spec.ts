import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User } from '../../../app/shared/model/user.data';

describe('user.data.ts', () => {
    let user: User;


    beforeEach(() => {
    });

    describe("Serialization", () => {

        describe("deserialize", () => {
            it("should deserialize a valid input", () => {
                let input = JSON.parse('{"name": "John Doe", "email":"jdoe@domain.com", "picture":"http://address.com", "user_id":"unique" }');
                let deserialized = new User().deserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized.name).toBe("John Doe");
                expect(deserialized.email).toBe("jdoe@domain.com");
                expect(deserialized.picture).toBe("http://address.com");
                expect(deserialized.user_id).toBe("unique")
            });

            it("should return undefined when deserializing an invalid input", () => {
                let input = JSON.parse('{"notaname": "John Doe"}');
                let deserialized = new User().deserialize(input);
                expect(deserialized).toBeUndefined();
            });
        });

        describe("tryDeserialize", () => {
            it("should return true when input is valid", () => {
                let input = JSON.parse('{"name": "John Doe", "email":"jdoe@domain.com", "picture":"http://address.com", "user_id" :"unique"}');
                let deserialized = new User().tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(true);
                expect(deserialized[1]).toBeDefined();
                expect(deserialized[1].name).toBe("John Doe");
                expect(deserialized[1].email).toBe("jdoe@domain.com");
                expect(deserialized[1].picture).toBe("http://address.com");
                expect(deserialized[1].user_id).toBe("unique");
            });

            it("should return false when input is invalid", () => {
                let input = JSON.parse('{"name": "John Doe"}');
                let deserialized = new User().tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });

            it("should return false when parsing fails", () => {
                let user = new User();
                let input = JSON.parse('{}');
                spyOn(user, "deserialize").and.throwError("Cannot be parsed");
                let deserialized = user.tryDeserialize(input);
                expect(deserialized).toBeDefined();
                expect(deserialized[0]).toBe(false);
                expect(deserialized[1]).toBeUndefined();
            });
        });
    });
});
