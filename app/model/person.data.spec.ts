import { ComponentFixture, TestBed } from '@angular/core/testing';
import {Person} from './person.data';

describe('Person Tests', () => {
    let person:Person;

let  NAME:string = "Team member name";
   
    beforeEach(() => {
    });
 
    it('Creates new correctly', () => {
        person = new Person(NAME);
 
        expect(person.name).toBe(NAME);
    });
});
 