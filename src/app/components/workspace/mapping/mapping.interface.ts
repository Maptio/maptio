import { SelectableTag } from "../../../shared/model/tag.data";
import { Initiative } from "../../../shared/model/initiative.data";
import { Subject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { Angulartics2Mixpanel } from "angulartics2";

export interface IDataVisualizer {
    teamName: string;
    teamId: string;

    datasetId: string;

    width: number;

    height: number;

    margin: number;

    zoom$: Observable<number>;

    // fontSize$: Observable<number>;
    fontColor$: Observable<string>;
    mapColor$: Observable<string>;

    zoomInitiative$: Observable<Initiative>;
    selectableTags$: Observable<Array<SelectableTag>>;
    toggleOptions$:Observable<Boolean>;

    isReset$: Observable<boolean>;

    translateX: number;
    translateY: number;
    scale: number;
    tagsState: Array<SelectableTag>;

    showDetailsOf$: Subject<Initiative>;
    showToolipOf$ : Subject<{initiatives : Initiative[], isNameOnly:boolean}>;
    showContextMenuOf$ : Subject<{initiatives:Initiative[], x : Number, y:Number, isReadOnlyContextMenu:boolean}>;
    // addInitiative$: Subject<Initiative>;
    // removeInitiative$: Subject<Initiative>;
    moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }>;
    closeEditingPanel$: Subject<boolean>;

    analytics: Angulartics2Mixpanel;

    init(): void;
}