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
    shortid: string;
  }[];

  // TODO: Consider moving these additions for state and type elsewhere
  isPrimary: boolean;
  isChildOfPrimary: boolean;
  isLeaf: boolean;
  isSelected: boolean;
  isOpened: boolean;
  isFilteredOut: boolean;
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

export interface TagViewModel {
  name: string;
  color: string;
  textStartOffset: number;
  pathId: string;
  pathStartAngle: number;
  pathEndAngle: number;
  path: string;
}

export type InitiativeNode = HierarchyCircularNode<InitiativeViewModel>;
