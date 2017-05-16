import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'unauthorized',
    template: '<div>Not authorized.</div>'
})
export class UnauthorizedComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}