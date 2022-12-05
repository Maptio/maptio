import { DataSet } from './dataset.data';
import { Initiative } from './initiative.data';
import { SelectableTag } from './tag.data';

export interface CircleMapData {
  dataset: DataSet;
  rootInitiative: Initiative;
  seedColor: string;
}

export interface CircleMapDataExpanded {
  dataset: DataSet;
  rootInitiative: Initiative;
  seedColor: string;
  tagsState: SelectableTag[];
}
