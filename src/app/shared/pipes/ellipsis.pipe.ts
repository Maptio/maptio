import { Pipe } from "@angular/core";

@Pipe({
  name: "ellipsis"
})
export class EllipsisPipe {
  transform(value: string, desiredLength: number) {
    if (desiredLength === undefined) {
      return value;
    }

    if (value.length > desiredLength) {
      return value.substring(0, desiredLength) + "...";
    } else {
      return value;
    }
  }
}
