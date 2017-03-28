import { Initiative } from './initiative.data';
//import { Serializable, Serialize, SerializeOpt, SerializeArray } from "ts-serialize"

export class DataSet  {

  // toJson(): { [key: string]: string | number | boolean | JsObject | (string | number | boolean | JsObject)[] | (string | number | boolean | JsObject)[][]; } {
  //   throw new Error('Method not implemented.');
  // }
  // toString(tabLength?: number): string {
  //   throw new Error('Method not implemented.');
  // }

  //content: any;

  name: string;

  url: string;

  //@JsonProperty("_id")
  //@Serialize("_id")
  _id: string;

  //@JsonProperty("createdOn")
  //@Serialize("createdOn")
  createdOn: Date;

  //@JsonProperty({ clazz: Initiative })
  //@Serialize()
  initiative: Initiative;


  public constructor(init?: Partial<DataSet>) {
    //super();
    Object.assign(this, init);
  }

  static create(): DataSet {
    return new DataSet();
  }

  deserialize(input: any): DataSet {
    // let deserialized = new DataSet();
    // deserialized.content = input.content;
    // deserialized._id = input._id;
    //deserialized.name = input.name;
    // deserialized.url = input.url;
    // deserialized.createdOn = input.createdOn;
    // deserialized.initiative = input.initiative;
    // return Serializable.fromJsObject<DataSet>(input).getOrElse(() => {
      return DataSet.EMPTY;
    // });
    // return deserialized;
  }
  tryDeserialize: (input: any) => [boolean, DataSet];

  static EMPTY: DataSet = new DataSet({});
}