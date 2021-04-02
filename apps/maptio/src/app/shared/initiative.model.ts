import { HierarchyCircularNode } from 'd3-hierarchy';


export interface Initiative {
  name: string;
  color: string;
  accountable?: {
    picture: string;
  };
  helpers?: {
    picture: string;
  }[];

  // TODO: Consider moving these additions for state and type elsewhere
  isPrimary: boolean;
  isChildOfPrimary: boolean;
  isLeaf: boolean;
  isSelected: boolean;
}

export type InitiativeNode = HierarchyCircularNode<Initiative>;
