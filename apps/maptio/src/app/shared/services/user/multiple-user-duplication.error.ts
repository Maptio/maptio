import { DuplicationError } from "./duplication.error";

export class MultipleUserDuplicationError extends DuplicationError {
  constructor(message: string) {
    super(message);
    this.name = "MultipleUserDuplicationError";
  }
}
