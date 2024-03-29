import { HierarchyCircularNode } from 'd3-hierarchy';

export interface InitiativeViewModel {
  id: number;

  name: string;
  description: string;
  color: string; // Not in other initative

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
  shortid: string;
  picture: string;
  name: string;
  roles: Array<Role>;
}

export interface Role {
  title?: string;
  description?: string;
}

export type InitiativeNode = HierarchyCircularNode<InitiativeViewModel>;
