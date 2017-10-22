import { Subject } from "rxjs/Rx";
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

    draw(data: any, translateX: number, translateY: number, scale: number): void;
}