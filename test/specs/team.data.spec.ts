import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Team } from '../../app/model/team.data';
import { Person } from '../../app/model/person.data';

describe('Team Tests', () => {
    let team: Team;

    beforeEach(() => {
    });

     it('When members is empty, it creates new correctly', () => {
        team = new Team([]);
        expect(team.members.length).toBe(0);
    });

    it('Creates new correctly', () => {
        let person1 = new Person("member 1");
        let person2 = new Person("member 2");
        let person3 = new Person("member 3");

        team = new Team([person1, person2, person3]);

        expect(team.members.length).toBe(3);
    });
});
