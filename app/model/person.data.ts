import { Serializable } from "../interfaces/serializable.interface";

export class Person implements Serializable<Person> {

    public name: string;

    constructor() { }

    deserialize(input: any): Person {
        this.name = (input.name) ? input.name : undefined;
        return this;
    }
}

