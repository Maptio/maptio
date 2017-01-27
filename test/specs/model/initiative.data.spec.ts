import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitiativeNode } from '../../../app/model/initiative.data';

describe('initiative.data.ts', () => {
 
    

    beforeEach(() => {
    });
    
    it('Leaves description undefined at creation', () => {
        let target = new InitiativeNode();
        expect(target.description).toBeUndefined();
    });

});
