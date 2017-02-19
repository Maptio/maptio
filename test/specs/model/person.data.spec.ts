import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Person } from '../../../app/shared/model/person.data';

describe('Person Tests', () => {
    let person: Person;

    let NAME: string = "Team member name";

    beforeEach(() => {
    });

    describe("Serialization", () => {

        it("should deserialize a valid input", () => {
            let input = JSON.parse('{"name": "John Doe"}');
            let deserialized = new Person().deserialize(input);
            expect(deserialized).toBeDefined();
            expect(deserialized.name).toBe("John Doe");
        });

        it("should return undefined when deserializing an invalid input", () => {
            let input = JSON.parse('{"notaname": "John Doe"}');
            let deserialized = new Person().deserialize(input);
            expect(deserialized).toBeUndefined();
        });

        it("should throw error when calling tryDeserialize", () => {
            expect(function () {
                new Person().tryDeserialize("");
            }).toThrowError();
        });
    });


});
