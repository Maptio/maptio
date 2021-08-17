import { DataSet } from "./dataset.data";
import { Initiative } from "./initiative.data";

export interface CircleMapData {
  dataset: DataSet;
  rootInitiative: Initiative;
  seedColor: string;
}
