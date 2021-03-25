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
  state?: CircleState;
  isRoot: boolean;
  isPrimary: boolean;
  isSecondary: boolean;
  isLeaf: boolean;
  isSelected: boolean;
}
