import { Initiative } from "./initiative.data";
import { Serializable } from "./../interfaces/serializable.interface";
import { Tag, DEFAULT_TAGS } from "./tag.data";
import { Team } from "./team.data";

/**
 * Represents a initiative with its team and tags
 */
export class DataSet implements Serializable<DataSet> {
  public shortid: string;

  datasetId: string;

  initiative: Initiative;

  team: Team;

  depth: number;

  tags: Array<Tag>;

  isArchived: boolean;

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
    deserialized.depth = input.depth;
    deserialized.datasetId = input._id;
    deserialized.initiative = Initiative.create().deserialize(input.initiative || input);
    deserialized.isArchived = input.isArchived;
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

  getName() {
    return this.initiative && this.initiative.children && this.initiative.children[0] ? this.initiative.children[0].name : "";
  }

  getHash() {
    // let start = Date.now();
    // let datasetUID = '';
    // this.initiative.traverse(n => {
    //   //${n.accountable ? n.accountable.user_id : ''}${n.helpers.map(h => h.user_id).join('')
    //   datasetUID += `\n${n.children ? n.children.length : 0}${n.name}`
    // });
    // console.log("getHash", datasetUID, Date.now()-start)
    return this.hashCode(JSON.stringify(this.initiative));
  }

  private hashCode(str: string) {
    let hash = 0;
    let char: number;
    if (str.length == 0) return hash;
    for (let i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}