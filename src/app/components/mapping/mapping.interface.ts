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

    data$: Subject<{ initiative: Initiative, datasetId: string }>;

    translateX: number;
    translateY: number;
    scale: number;

    showDetailsOf$: Subject<Initiative>;

    addInitiative$: Subject<Initiative>;
    removeInitiative$: Subject<Initiative>;


    draw(): void
    // draw(translateX: number, translateY: number, scale: number): void;
}