export class DataSet {

  content: any;

  name: string;

  url: string;

  id:string;

  public constructor(init?: Partial<DataSet>) {
    Object.assign(this, init);
  }

  static EMPTY: DataSet = new DataSet({ name: "New project", url: "../../../assets/datasets/new.json" });
}