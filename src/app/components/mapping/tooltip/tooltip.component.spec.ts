import { TestBed, inject } from '@angular/core/testing';

import { TooltipComponent } from './tooltip.component';

describe('a tooltip component', () => {
	let component: TooltipComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TooltipComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TooltipComponent], (target: TooltipComponent) => {
		// component = TooltipComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});