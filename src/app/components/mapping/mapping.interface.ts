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

    isReset$: Subject<boolean>;

    translateX: number;
    translateY: number;
    scale: number;

    showDetailsOf$: Subject<Initiative>;

    addInitiative$: Subject<Initiative>;
    removeInitiative$: Subject<Initiative>;
    moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }>;
    closeEditingPanel$: Subject<boolean>;
    init(): void;
}