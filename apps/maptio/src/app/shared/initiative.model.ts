import { CircleState } from './circle-state.enum';

export interface Initiative {
  name: string;
  colour: string;
  accountable?: {
    picture: string;
  };
  helpers?: {
    picture: string;
  }[];
  state: CircleState;
}
