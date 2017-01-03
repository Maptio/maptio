import { Team } from './team.data'

export class DataSet {

  content: any;

  constructor(public name: string, public url: string) { }

  static EMPTY: DataSet = new DataSet("New project", '../../../assets/datasets/new.json');

}