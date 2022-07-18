import * as slug from 'slug';
import { set, addDays, differenceInDays, isAfter } from 'date-fns';

import { environment } from '@maptio-config/environment';
import { Serializable } from './../interfaces/serializable.interface';

import { SlackIntegration } from './integrations.data';
import { User } from './user.data';
import { Role } from './role.data';

/**
 * Represents a team
 */
export class Team implements Serializable<Team> {
  /**
   * Unique Id
   */
  public team_id: string;

  /**
   * Team short id (URL friendly)
   */
  public shortid: string;

  /**
   * Name of team
   */
  public name: string;

  /**
   * True if the team is temporary, false otherwise
   * N.B. Temporary team is needed as placeholder so that users can create maps
   */
  public isTemporary: boolean;

  /**
   * List of associated team ids
   * i.e. demo teams
   */
  public associatedTeams: string[];

  /**
   * True if this team is used for demo purposed, false otherwise
   */
  public isExample: boolean;

  /**
   * List of team members
   */
  public members: Array<User>;

  /**
   * Library of roles
   */
  public roles: Array<Role>;

  public settings: { authority: string; helper: string };

  public slack: SlackIntegration;

  public createdAt: Date;

  public freeTrialLength: number;

  public isPaying: boolean;

  public planName: string;

  public planLimit: number;
  public planMonthlyPrice: number;

  public constructor(init?: Partial<Team>) {
    Object.assign(this, init);
  }

  static create(): Team {
    return new Team();
  }

  deserialize(input: any): Team {
    if (!input._id) {
      return undefined;
    }

    const deserialized = new Team();
    deserialized.name = input.name;
    deserialized.team_id = input._id;
    deserialized.shortid = input.shortid;

    if (input.members) {
      deserialized.members = [];
      input.members.forEach((member: any) => {
        deserialized.members.push(User.create().deserialize(member));
      });
    }

    const roles = new Array<Role>();
    if (input.roles && input.roles instanceof Array && input.roles.length > 0) {
      input.roles.forEach(function (inputRole: any) {
        roles.push(new Role().deserialize(inputRole));
      });
    }
    deserialized.roles = roles;

    deserialized.isTemporary = input.isTemporary;
    deserialized.isExample = input.isExample;
    deserialized.settings = {
      authority: environment.DEFAULT_AUTHORITY_TERMINOLOGY,
      helper: environment.DEFAULT_HELPER_TERMINOLOGY,
    };
    deserialized.settings.authority = input.settings
      ? input.settings.authority || environment.DEFAULT_AUTHORITY_TERMINOLOGY
      : environment.DEFAULT_AUTHORITY_TERMINOLOGY;
    deserialized.settings.helper = input.settings
      ? input.settings.helper || environment.DEFAULT_HELPER_TERMINOLOGY
      : environment.DEFAULT_HELPER_TERMINOLOGY;
    deserialized.slack = SlackIntegration.create().deserialize(
      input.slack || {}
    );

    return deserialized;
  }

  tryDeserialize(input: any): [boolean, Team] {
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

  getSlug(): string {
    return slug(this.name || '', { lower: true }) || 'team';
  }

  getFreeTrialCutoffDate(): Date {
    return addDays(this.createdAt, <number>this.freeTrialLength);
  }

  getFreeTrialTimeLeftMessage(): string {
    const remainingTrialDays = this.getRemainingTrialDays();

    if (remainingTrialDays > 1) {
      return `Free trial time left: ${remainingTrialDays} days`;
    } else if (remainingTrialDays === 1) {
      return 'Your free trial ends tomorrow!';
    } else if (remainingTrialDays === 0) {
      return 'Your free trial ends today!';
    } else {
      return 'Your free trial has ended!';
    }
  }

  getRemainingTrialDays() {
    const cutoffDate = this.getFreeTrialCutoffDate();

    const midnightAfterLastDay = set(addDays(cutoffDate, 1), {
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    // Calculate days remaining based on the midnight after the last day to be
    // able to say "1 day remaining" or "your free trial ends tomorrow" on the
    // day before the trial ends
    const today = Date.now();
    let daysRemaining = differenceInDays(midnightAfterLastDay, today);

    // Be more precise on the last day
    if (isAfter(today, cutoffDate)) {
      daysRemaining = -1;
    }

    return daysRemaining;
  }

  isTeamLateOnPayment() {
    const cutoffDate = this.getFreeTrialCutoffDate();
    return this.isPaying ? false : isAfter(Date.now(), cutoffDate);
  }
}
