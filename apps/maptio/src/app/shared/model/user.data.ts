import * as slug from 'slug';
import { parseISO } from 'date-fns';

import { Serializable } from '../interfaces/serializable.interface';
import { Team } from './team.data';
import { UserRole } from './permission.data';
import { OnboardingProgress } from './onboarding-progress.data';

// Helper types to make matching user roles within teams easier
export type UserRoleArray = [string, UserRole][];
export type UserRoleMap = Map<string, UserRole>;

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

  /**
   * User status e.g. Standard, Admin, Guest, etc. in each team
   *
   * This is an array of tuples instead of the more natural Map to make
   * serialization easier.
   */
  public userRole: UserRoleArray;

  public onboardingProgress: OnboardingProgress;

  public consentForSessionRecordings: boolean;
  public consentForSessionRecordingsUpdatedAt: Date | null;

  public constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  static create(): User {
    return new User();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserialize(input: any): User {
    if (!input?.user_id) {
      return undefined;
    }

    const deserialized = new User();

    deserialized.isInAuth0 = input.isInAuth0;

    deserialized.shortid = input.shortid;

    deserialized.firstname = input.firstname;

    deserialized.lastname = input.lastname;

    deserialized.name = this.createNameFromFirstAndLastNames(
      deserialized.firstname,
      deserialized.lastname,
      input.name
    );

    deserialized.isActivationPending = input.isActivationPending;

    deserialized.isInvitationSent = input.isInvitationSent;

    deserialized.loginsCount = input.loginsCount;
    deserialized.lastSeenAt = input.lastSeenAt
      ? parseISO(input.lastSeenAt)
      : null;
    deserialized.createdAt = input.createdAt ? parseISO(input.createdAt) : null;

    deserialized.nickname = input.nickname;
    deserialized.email = input.email;

    deserialized.picture = input.picture;

    deserialized.user_id = input.user_id; // specific to Auth0

    deserialized.teams = [];
    if (input.teams) {
      input.teams.forEach((t: Team) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        deserialized.teams.push(t);
      });
    }

    deserialized.userRole = this.deserializeUserRole(
      input.userRole,
      deserialized.teams
    );

    deserialized.datasets = [];
    if (input.datasets) {
      input.datasets.forEach((d: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        deserialized.datasets.push(d);
      });
    }

    deserialized.consentForSessionRecordings =
      input.consentForSessionRecordings || false;
    deserialized.consentForSessionRecordingsUpdatedAt = input.consentForSessionRecordingsUpdatedAt
      ? parseISO(input.consentForSessionRecordingsUpdatedAt)
      : null;

    deserialized.onboardingProgress = OnboardingProgress.create().deserialize(
      input.onboardingProgress
    );

    return deserialized;
  }

  tryDeserialize(input: any): [boolean, User] {
    // eslint-disable-line @typescript-eslint/no-explicit-any
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

  getUserRoleInOrganization(teamId: string): UserRole {
    const userRoleMap = this.convertUserRoleArrayToMap(this.userRole);
    return userRoleMap.get(teamId);
  }

  setUserRole(teamId: string, newUserRoleInOrganization: UserRole) {
    const userRoleMap = this.convertUserRoleArrayToMap(this.userRole);
    userRoleMap.set(teamId, newUserRoleInOrganization);
    this.userRole = this.convertUserRoleMapToArray(userRoleMap);
  }

  deleteUserRole(teamId: string) {
    const userRoleMap = this.convertUserRoleArrayToMap(this.userRole);
    userRoleMap.delete(teamId);
    this.userRole = this.convertUserRoleMapToArray(userRoleMap);
  }

  /**
   * Deal with old data where userRole was a string
   *
   * This method converts the old string values to a map of teamId -> UserRole
   * as well as simply reading the new format
   *
   * @param userRole
   * @param teams
   */
  deserializeUserRole(
    userRoleInput: UserRoleArray | string | number | undefined | null,
    teamIds: string[]
  ): [string, UserRole][] {
    let userRoleMap = new Map<string, UserRole>();

    if (
      userRoleInput === 0 ||
      userRoleInput === '0' ||
      userRoleInput === 1 ||
      userRoleInput === '1'
    ) {
      // Old format, convert to new format
      teamIds.forEach((teamId) => {
        // Convert input string to UserRole, if it fails, use Standard
        const convertedUserRole = UserRole[userRoleInput]
          ? ((userRoleInput as unknown) as UserRole)
          : UserRole.Standard;

        userRoleMap.set(teamId, convertedUserRole);
      });
    } else if (userRoleInput === undefined || userRoleInput === null) {
      // Old format, convert to new format
      teamIds.forEach((teamId) => {
        userRoleMap.set(teamId, UserRole.Standard);
      });
    } else {
      // New format, just read it
      userRoleMap = new Map(userRoleInput as UserRoleArray);
    }

    return this.convertUserRoleMapToArray(userRoleMap);
  }

  private convertUserRoleArrayToMap(userRoleArray: UserRoleArray): UserRoleMap {
    return new Map(userRoleArray);
  }

  private convertUserRoleMapToArray(
    userRoleMap: Map<string, UserRole>
  ): [string, UserRole][] {
    return Array.from(userRoleMap.entries());
  }
}

export interface SerializableUser extends Omit<User, 'userRole'> {
  userRole: string;
}

export class SelectableUser extends User {
  public isSelected: boolean;

  public constructor(init?: Partial<SelectableUser>) {
    super();
    Object.assign(this, init);
  }
}

export interface MemberFormFields {
  firstname: string;
  lastname: string;
  email: string;
  picture: string;
}
