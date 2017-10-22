import { Initiative } from "./../../shared/model/initiative.data";
import { Observable } from "rxjs/Observable";

export interface IDataVisualizer {

    datasetId: string;

    width: number;

    height: number;

    margin: number;

    zoom$: Observable<number>;

    fontSize$: Observable<number>;

    showDetailsOf$: Subject<Initiative>;

    draw(data: any): void;
}