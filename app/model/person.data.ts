import { OnInit } from '@angular/core';

export class Person implements OnInit {

    constructor(public name: string) { }

    ngOnInit() {
        if (this.name === undefined)
            throw new Error("A person needs to have a name");
    }
}

