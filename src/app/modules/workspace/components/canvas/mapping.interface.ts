import { SelectableTag, Tag } from "../../../../shared/model/tag.data";
import { Initiative } from "../../../../shared/model/initiative.data";
import { Subject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { SelectableUser, User } from "../../../../shared/model/user.data";

export interface IDataVisualizer {
    datasetId: string;

    width: number;

    height: number;

    margin: number;

    zoom$: Observable<number>;

    mapColor$: Observable<string>;

    zoomInitiative$: Observable<Initiative>;
    selectableTags$: Observable<Array<Tag>>;
    selectableUsers$ : Observable<Array<User>>;
    isReset$: Observable<boolean>;

    translateX: number;
    translateY: number;
    scale: number;

    showDetailsOf$: Subject<Initiative>;
    showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }>;
    showContextMenuOf$: Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }>;

    analytics: Angulartics2Mixpanel;

    init(): void;
}