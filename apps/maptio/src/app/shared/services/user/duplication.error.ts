export class DuplicationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DuplicationError";
  }
}
