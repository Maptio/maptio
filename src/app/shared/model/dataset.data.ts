import { Serializable } from './../interfaces/serializable.interface';
export class DataSet implements Serializable<DataSet> {



  content: any;

  name: string;

  url: string;

  id: string;

  public constructor(init?: Partial<DataSet>) {
    Object.assign(this, init);
  }

  static create(): DataSet {
    return new DataSet();
  }

  deserialize(input: any): DataSet {
    let deserialized = new DataSet();
    deserialized.content = input.content;
    deserialized.id = input.id;
    deserialized.name = input.name;
    deserialized.url = input.url;
    return deserialized;
  }
  tryDeserialize: (input: any) => [boolean, DataSet];

  static EMPTY: DataSet = new DataSet({ name: "New project", url: "../../../assets/datasets/new.json" });
}