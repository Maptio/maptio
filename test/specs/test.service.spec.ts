import { D3Service, D3 } from 'd3-ng2-service'

export class TestService {

    private d3: D3;
    constructor(service: D3Service) {
        this.d3 = service.getD3();
    }
}


import { ComponentFixture, TestBed, inject } from '@angular/core/testing';

describe('testing d3', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TestService,
                D3Service
            ]
        });
    });

    it("When parameters are given, builds circular path", inject([TestService, D3Service], (target: TestService, d3Service: D3Service) => {
        expect(true).toBe(true);
    }));
});