import { Subject } from "rxjs/Rx";
import { Initiative } from "./../../shared/model/initiative.data";
import { Observable } from "rxjs/Observable";
import { Angulartics2Mixpanel } from "angulartics2/dist";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { SelectableUser } from "../../shared/model/user.data";

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
    // selectableUsers$: Observable<Array<SelectableUser>>;

    // isLocked$: Observable<boolean>;

    data$: Subject<{ initiative: Initiative, datasetId: string }>;

    isReset$: Observable<boolean>;

    translateX: number;
    translateY: number;
    scale: number;
    tagsState: Array<SelectableTag>;

    showDetailsOf$: Subject<Initiative>;

    addInitiative$: Subject<Initiative>;
    removeInitiative$: Subject<Initiative>;
    moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }>;
    closeEditingPanel$: Subject<boolean>;

    analytics: Angulartics2Mixpanel;

    init(): void;
}