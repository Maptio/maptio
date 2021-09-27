import { HierarchyCircularNode } from 'd3-hierarchy';


export interface Initiative {
  name: string;
  color: string;

  accountable?: Helper;
  helpers?: Helper[];

  tags?: {
    name: string;
    color: string;
  }[];

  // TODO: Consider moving these additions for state and type elsewhere
  isPrimary: boolean;
  isChildOfPrimary: boolean;
  isLeaf: boolean;
  isSelected: boolean;
  isOpened: boolean;
}

export interface Helper {
  picture: string;
  name: string;
  roles: Array<Role>;
}

export interface Role {
  title?: string;
  description?: string
}

export type InitiativeNode = HierarchyCircularNode<Initiative>;
