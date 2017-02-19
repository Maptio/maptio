import { Serializable } from "../interfaces/serializable.interface";

export class Person implements Serializable<Person> {

    public name: string;

    constructor() { }

    deserialize(input: any): Person {
        if (input.name) {
            this.name = input.name;
            return this;
        }
        else {
            return undefined;
        }
    }

    tryDeserialize(input: any): [boolean, Person] {
        throw new Error("Not implemented");
    }
}

