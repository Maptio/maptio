import { Subject } from "rxjs/Rx";
import { Initiative } from "./../../shared/model/initiative.data";
import { Observable } from "rxjs/Observable";
import { Angulartics2Mixpanel } from "angulartics2/dist";

export interface IDataVisualizer {
    teamName: string;
    teamId: string;


    datasetId: string;

    width: number;

    height: number;

    margin: number;

    zoom$: Observable<number>;

    fontSize$: Observable<number>;

    isLocked$: Observable<boolean>;

    data$: Subject<{ initiative: Initiative, datasetId: string }>;

    isReset$: Observable<boolean>;

    translateX: number;
    translateY: number;
    scale: number;

    showDetailsOf$: Subject<Initiative>;

    addInitiative$: Subject<Initiative>;
    removeInitiative$: Subject<Initiative>;
    moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }>;
    closeEditingPanel$: Subject<boolean>;

    analytics: Angulartics2Mixpanel;

    init(): void;
}