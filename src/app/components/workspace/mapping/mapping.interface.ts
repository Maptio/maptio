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

    mapColor$: Observable<string>;

    zoomInitiative$: Observable<Initiative>;
    selectableTags$: Observable<Array<SelectableTag>>;

    isReset$: Observable<boolean>;

    translateX: number;
    translateY: number;
    scale: number;
    tagsState: Array<SelectableTag>;

    showDetailsOf$: Subject<Initiative>;
    showToolipOf$ : Subject<{initiatives : Initiative[], isNameOnly:boolean}>;
    showContextMenuOf$ : Subject<{initiatives:Initiative[], x : Number, y:Number, isReadOnlyContextMenu:boolean}>;
    moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }>;

    analytics: Angulartics2Mixpanel;

    init(): void;
}