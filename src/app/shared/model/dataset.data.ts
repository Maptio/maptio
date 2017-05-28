import { Serializable } from "./../interfaces/serializable.interface";
export class DataSet implements Serializable<DataSet> {

  content: any;

  name: string;

  url: string;

  _id: string;

  team_id: string;

  createdOn: Date;

  public constructor(init?: Partial<DataSet>) {
    Object.assign(this, init);
  }

  static create(): DataSet {
    return new DataSet();
  }

  deserialize(input: any): DataSet {
    let deserialized = new DataSet();
    deserialized.content = input.content;
    deserialized._id = input._id;
    deserialized.team_id = input.team_id;
    deserialized.name = input.name;
    deserialized.url = input.url;
    deserialized.createdOn = input.createdOn;
    return deserialized;
  }
  tryDeserialize: (input: any) => [boolean, DataSet];

  static EMPTY: DataSet = new DataSet({ name: "New project", url: "../../../assets/datasets/new.json" });
}