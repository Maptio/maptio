import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "keys" })
export class KeysPipe implements PipeTransform {
    transform(value: any, args: string[]): any {
        let keys = [];
        for (let enumMember in value) {
            if (!isNaN(parseInt(enumMember, 10))) {
                keys.push({ key: enumMember, value: value[enumMember] });
            }
        }
        return keys;
    }
}