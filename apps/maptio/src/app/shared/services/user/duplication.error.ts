import { User } from "@maptio-shared/model/user.data";

export class DuplicationError extends Error {
  duplicateUsers: User[];

  constructor(message: string, duplicateUsers: User[]) {
    super(message);
    this.name = "DuplicationError";
    this.duplicateUsers = duplicateUsers;
  }
}
