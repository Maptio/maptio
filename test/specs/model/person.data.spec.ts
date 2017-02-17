import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Person } from '../../../app/model/person.data';

describe('Person Tests', () => {
    let person: Person;

    let NAME: string = "Team member name";

    beforeEach(() => {
    });

    xit('Creates new correctly', () => {
        person = new Person();
        person.name = NAME;
        //person.ngOnInit();
        expect(person.name).toBe(NAME);
    });

    xit('When name is undefined, it throws', () => {

        expect(function () {
            person = new Person();
            person.name = undefined;
           // person.ngOnInit();

        }).toThrow();
    });
});
