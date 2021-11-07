import * as slug from 'slug';
import * as parse from 'date-fns/parse';

import { UserRole } from './permission.data';
import { Serializable } from '../interfaces/serializable.interface';

/**
 * A user
 */
export class User implements Serializable<User> {
  /** Is this person a user within Auth0 or just a team member without an account? */
  public isInAuth0: boolean;

  /** Unique Id (specific to Auth0 schema) */
  public user_id: string;

  /** Team short id (URL friendly) */
  public shortid: string;

  /** User name */
  public name: string;

  /** User first name */
  public firstname: string;

  /** User last name */
  public lastname: string;

  /** User nickname */
  public nickname: string;

  /** User email */
  public email: string;

  /** User picture URL */
  public picture: string;

  /** True if activation is pending, false otherwise */
  public isActivationPending = false;

  /** True if an invitation has been sent to this user, false otherwise */
  public isInvitationSent = false;

  /** True if the user has been deleted (from Auth0 for instance) */
  public isDeleted = false;

  public lastSeenAt: Date;
  public createdAt: Date;

  /** Number of logins */
  public loginsCount: number;

  /** List of teams */
  public teams: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Example team */
  public exampleTeamIds: string[];

  /** List of datasets */
  public datasets: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

  /** List of permissions */
  // public permissions: Permissions[];

  /** User status e.g. Standard, Admin, Guest, etc. */
  public userRole: UserRole;

  public constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  static create(): User {
    return new User();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserialize(input: any): User {
    if (!input.user_id) {
      return undefined;
    }

    const deserialized = new User();

    // If a user was created before this field was added, they can be assumed
    // to have had an account in Auth0 created for them
    deserialized.isInAuth0 = input.isInAuth0 ?? true;

    deserialized.shortid = input.shortid;

    deserialized.firstname =
      (input.user_metadata
        ? input.user_metadata.given_name
        : input.given_name) || input.firstname;

    deserialized.lastname =
      (input.user_metadata
        ? input.user_metadata.family_name
        : input.family_name) || input.lastname;

    deserialized.name = this.createNameFromFirstAndLastNames(
      deserialized.firstname,
      deserialized.lastname,
      input.name
    );

    deserialized.isActivationPending =
      input.app_metadata && input.app_metadata.activation_pending
        ? input.app_metadata.activation_pending
        // If user not sent to Auth0, activation is pending, otherwise return
        // false as before
        : !deserialized.isInAuth0;

    deserialized.isInvitationSent =
      input.app_metadata && input.app_metadata.invitation_sent
        ? input.app_metadata.invitation_sent
        : false;

    deserialized.userRole =
      input.app_metadata && input.app_metadata.role
        ? (<any>UserRole)[input.app_metadata.role] // eslint-disable-line @typescript-eslint/no-explicit-any
        : UserRole.Standard;

    deserialized.loginsCount = input.logins_count;
    deserialized.lastSeenAt = input.last_login ? parse(input.last_login) : null;
    deserialized.createdAt = input.created_at ? parse(input.created_at) : null;

    deserialized.nickname = input.nickname;
    deserialized.email = input.email;

    deserialized.picture =
      input.user_metadata && input.user_metadata.picture
        ? input.user_metadata.picture
        : input.picture;

    deserialized.user_id = input.user_id; // specific to Auth0

    deserialized.teams = [];
    if (input.teams) {
      input.teams.forEach((t: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        deserialized.teams.push(t);
      });
    }

    deserialized.datasets = [];
    if (input.datasets) {
      input.datasets.forEach((d: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        deserialized.datasets.push(d);
      });
    }

    return deserialized;
  }

  tryDeserialize(input: any): [boolean, User] { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const user = this.deserialize(input);
      if (user !== undefined) {
        return [true, user];
      } else {
        return [false, undefined];
      }
    } catch (Exception) {
      return [false, undefined];
    }
  }

  getSlug() {
    // Support for non latin character is lacking for now
    // HACK: if slug is empty, return 'user'
    return slug(this.name || this.nickname || '', { lower: true }) || 'user';
  }

  createNameFromFirstAndLastNames(
    firstname: string,
    lastname: string,
    name: string
  ) {
    if (firstname && lastname) {
      return `${firstname} ${lastname}`;
    } else if (firstname) {
      return firstname;
    } else {
      return name;
    }
  }
}

export class SelectableUser extends User {
  public isSelected: boolean;

  public constructor(init?: Partial<SelectableUser>) {
    super();
    Object.assign(this, init);
  }
}
