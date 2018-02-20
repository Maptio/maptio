import { Initiative } from "./initiative.data";
import { Serializable } from "./../interfaces/serializable.interface";
import { Tag, DEFAULT_TAGS } from "./tag.data";
import { Team } from "./team.data";

export class DataSet implements Serializable<DataSet> {
  public shortid: string;

  datasetId: string;

  initiative: Initiative;

  team: Team;

  depth: number;

  tags: Array<Tag>;

  public constructor(init?: Partial<DataSet>) {
    Object.assign(this, init);
  }

  static create(): DataSet {
    return new DataSet();
  }

  deserialize(input: any): DataSet {
    if (!input || !input._id) return
    let deserialized = new DataSet();
    deserialized.shortid = input.shortid;
    deserialized.datasetId = input._id;
    deserialized.initiative = Initiative.create().deserialize(input.initiative || input);
    let tags = new Array<Tag>();
    if (input.tags && input.tags instanceof Array && input.tags.length > 0) {
      input.tags.forEach(function (inputTag: any) {
        tags.push(new Tag().deserialize(inputTag))
      });
    }
    else {
      tags = DEFAULT_TAGS;
    }

    deserialized.tags = tags;
    // deserialized.createdOn = input.createdOn;
    return deserialized;
  }

  tryDeserialize(input: any): [boolean, DataSet] {
    try {
      let dataset = this.deserialize(input);
      if (dataset !== undefined) {
        return [true, dataset];
      }
      else {
        return [false, undefined]
      }
    }
    catch (Exception) {
      return [false, undefined]
    }
  }
}