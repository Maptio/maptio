export class DataSet{

  content:any;

  constructor(public name:string, public url:string){}

  static EMPTY:DataSet = new DataSet("NEW PROJECT", '../../../assets/datasets/new.json');
  
}