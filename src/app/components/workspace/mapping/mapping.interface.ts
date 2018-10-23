import { SelectableTag } from "./../../../shared/model/tag.data";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Subject } from "rxjs/Rx";
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
    fontColor$: Observable<string>;
    mapColor$: Observable<string>;

    zoomInitiative$: Observable<Initiative>;
    selectableTags$: Observable<Array<SelectableTag>>;
    toggleOptions$:Observable<Boolean>;

    data$: Subject<{ initiative: Initiative, datasetId: string }>;

    isReset$: Observable<boolean>;

    translateX: number;
    translateY: number;
    scale: number;
    tagsState: Array<SelectableTag>;

    // showDetailsOf$: Subject<Initiative>;
    showToolipOf$ : Subject<{initiatives : Initiative[], isNameOnly:boolean}>;
    showContextMenuOf$ : Subject<{initiatives:Initiative[], x : Number, y:Number}>;
    // addInitiative$: Subject<Initiative>;
    // removeInitiative$: Subject<Initiative>;
    moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }>;
    closeEditingPanel$: Subject<boolean>;

    analytics: Angulartics2Mixpanel;

    init(): void;
}