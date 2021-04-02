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

  // TODO: Consider moving these additions for state elsewhere
  isLeaf: boolean;
  isSelected: boolean;
}

export type InitiativeNode = HierarchyCircularNode<Initiative>;
