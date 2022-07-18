import { SelectableTag } from '../../../../shared/model/tag.data';
import { Initiative } from '../../../../shared/model/initiative.data';
import { Subject, Observable } from 'rxjs';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

export interface IDataVisualizer {
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
  showToolipOf$: Subject<{ initiatives: Initiative[]; isNameOnly: boolean }>;
  showContextMenuOf$: Subject<{
    initiatives: Initiative[];
    x: number;
    y: number;
    isReadOnlyContextMenu: boolean;
  }>;

  analytics: Angulartics2Mixpanel;

  init(): void;
}
