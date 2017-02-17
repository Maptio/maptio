import { OnInit } from '@angular/core';
import { Serializable } from '../interfaces/serializable.interface';

export class Person implements Serializable<Person> {

    public name: string;

    constructor() { }

    // ngOnInit() {
    //     console.log("NG ON INIT")
    //     if (this.name === undefined)
    //         throw new Error("A person needs to have a name");
    // }

    deserialize(input: any): Person {
        //console.log(input);
        this.name = (input.name) ? input.name : undefined;
        //console.log(this.name);
        return this;
    }
}

