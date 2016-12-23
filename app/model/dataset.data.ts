import {Person} from './person.data'

export class DataSet{

  content:any;

  team:Array<Person> = [{name:"Safiyya"}, {name:"Gabriel"}];

  constructor(public name:string, public url:string){}

  static EMPTY:DataSet = new DataSet("New project", '../../../assets/datasets/new.json');
  
}