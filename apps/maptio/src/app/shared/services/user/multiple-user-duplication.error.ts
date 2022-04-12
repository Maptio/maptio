export class MultipleUserDuplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MultipleUserDuplicationError";
  }
}
