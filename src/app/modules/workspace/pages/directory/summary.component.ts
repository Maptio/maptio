import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs";

import { Angulartics2Mixpanel } from "angulartics2/mixpanel";

import { DataService } from "../../services/data.service";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { Auth } from "../../../../core/authentication/auth.service";
import { UserService } from "../../../../shared/services/user/user.service";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableTag, Tag } from "../../../../shared/model/tag.data";
import { LoaderService } from "../../../../shared/components/loading/loader.service";

import { IDataVisualizer } from "../../components/canvas/mapping.interface";


@Component({
    selector: "summary",
    templateUrl: "./summary.component.html",
    styleUrls: ["./summary.component.css"],
    host: { "class": "w-100" },
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MappingSummaryComponent implements OnInit, IDataVisualizer {
    public datasetId: string;

    public width: number;
    public height: number;
    public margin: number;

    public zoom$: Observable<number>;
    public fontSize$: Observable<number>;
    public fontColor$: Observable<string>;
    public mapColor$: Observable<string>;

    public zoomInitiative$: Subject<Initiative>;
    public selectableTags$: Observable<Array<SelectableTag>>;
    public isReset$: Observable<boolean>;

    public translateX: number;
    public translateY: number;
    public scale: number;
    public tagsState: Array<SelectableTag>;

    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
    public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
    public showContextMenuOf$: Subject<{
        initiatives: Initiative[], x: Number, y: Number,
        isReadOnlyContextMenu: boolean
    }> = new Subject<{
        initiatives: Initiative[], x: Number, y: Number,
        isReadOnlyContextMenu: boolean
    }>();
    public analytics: Angulartics2Mixpanel;

    constructor(public auth: Auth, public route: ActivatedRoute, public datasetFactory: DatasetFactory,
        public userFactory: UserFactory, private userService: UserService, public teamFactory: TeamFactory, private dataService: DataService,
        public loaderService: LoaderService, private router: Router,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.loaderService.show();
        this.init();
    }

    onSelectInitiative(initiative: Initiative) {
        localStorage.setItem("node_id", initiative.id.toString());
                
        this.router.navigateByUrl(`/map/${this.dataset.datasetId}/${this.initiative.getSlug()}/circles`)
            .then(() => {});
    }

    init(): void {
        // throw new Error("Method not implemented.");
    }
}
