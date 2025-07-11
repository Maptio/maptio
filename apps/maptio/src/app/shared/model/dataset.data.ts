import { Initiative } from './initiative.data';
import { Serializable } from './../interfaces/serializable.interface';
import { Tag, DEFAULT_TAGS } from './tag.data';
import { User } from './user.data';
import { Role } from './role.data';
import { Team } from './team.data';

/**
 * Represents a initiative with its team and tags and roles
 */
export class DataSet implements Serializable<DataSet> {
  public shortid: string;

  datasetId: string;

  initiative: Initiative;

  team: Team;

  depth: number;

  tags: Array<Tag>;

  roles: Array<Role>;

  isArchived: boolean;

  isEmbeddable = false;
  showDescriptions = false;

  lastEditedAt: number;
  lastEditedBy: User;

  public constructor(init?: Partial<DataSet>) {
    Object.assign(this, init);
  }

  static create(): DataSet {
    return new DataSet();
  }

  deserialize(input: any): DataSet {
    if (!input || !input._id) return;
    const deserialized = new DataSet();
    deserialized.shortid = input.shortid;
    deserialized.depth = input.depth;
    deserialized.datasetId = input._id;
    deserialized.initiative = Initiative.create().deserialize(
      input.initiative || input,
    );
    deserialized.isArchived = input.isArchived;
    deserialized.isEmbeddable = input.isEmbeddable;
    deserialized.showDescriptions = input.showDescriptions
      ? input.showDescriptions
      : false;

    deserialized.lastEditedAt = input.lastEditedAt;
    deserialized.lastEditedBy = input.lastEditedBy
      ? User.create().deserialize(input.lastEditedBy)
      : undefined;

    let tags = new Array<Tag>();
    if (input.tags && input.tags instanceof Array && input.tags.length > 0) {
      input.tags.forEach(function (inputTag: any) {
        tags.push(new Tag().deserialize(inputTag));
      });
    } else {
      tags = DEFAULT_TAGS;
    }
    deserialized.tags = tags;

    const roles = new Array<Role>();
    if (input.roles && input.roles instanceof Array && input.roles.length > 0) {
      input.roles.forEach(function (inputRole: any) {
        roles.push(new Role().deserialize(inputRole));
      });
    }
    deserialized.roles = roles;

    // deserialized.createdOn = input.createdOn;
    return deserialized;
  }

  tryDeserialize(input: any): [boolean, DataSet] {
    try {
      const dataset = this.deserialize(input);
      if (dataset !== undefined) {
        return [true, dataset];
      } else {
        return [false, undefined];
      }
    } catch (Exception) {
      return [false, undefined];
    }
  }

  getName() {
    return this.initiative &&
      this.initiative.children &&
      this.initiative.children[0]
      ? this.initiative.children[0].name
      : '';
  }
}
