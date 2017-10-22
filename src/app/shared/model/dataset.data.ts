import { Initiative } from "./initiative.data";
import { Serializable } from "./../interfaces/serializable.interface";

export class DataSet implements Serializable<DataSet> {


  /**
     * Team short id (URL friendly)
     */
  public shortid: string;

  _id: string;

  // team_id: string;

  // createdOn: Date;

  initiative: Initiative;

  team: any;

  depth: number;

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
    deserialized._id = input._id;
    deserialized.initiative = Initiative.create().deserialize(input.initiative || input)
    // deserialized.createdOn = input.createdOn;
    return deserialized;
  }

  tryDeserialize(input: any): [boolean, DataSet] {
    try {
      let user = this.deserialize(input);
      if (user !== undefined) {
        return [true, user];
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