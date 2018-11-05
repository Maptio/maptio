import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { DatasetFactory } from '../../services/dataset.factory';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Team } from '../../model/team.data';
import { DataSet } from '../../model/dataset.data';
import { Initiative } from '../../model/initiative.data';
import { Auth } from '../../services/auth/auth.service';
import { Angulartics2Mixpanel } from 'angulartics2';
import { Router } from '@angular/router';
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'common-create-map',
    templateUrl: './create-map.component.html',
    styleUrls: ['./create-map.component.css']
})
export class CreateMapComponent implements OnInit {
    form: FormGroup;
    isCreatingMap: Boolean;
    @Input("teams") teams: Team[];
    @Input("isRedirect") isRedirect: Boolean;

    @Output("close") close = new EventEmitter<void>();
    @Output("created") created = new EventEmitter<DataSet>();

    constructor(private datasetFactory: DatasetFactory, private cd: ChangeDetectorRef,
        private router: Router, private intercom: Intercom) { }



    ngOnInit(): void {
        this.form = new FormGroup({
            "mapName": new FormControl("", {
                validators: [Validators.required, Validators.minLength(2)],
                updateOn: "submit"
            }),
            "teamId": new FormControl(this.teams.length > 1 ? null : this.teams[0].team_id, [Validators.required]),
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.teams && changes.teams.currentValue) {
            this.teams = changes.teams.currentValue;
        }
    }

    submit() {
        if (this.form.valid) {
            this.isCreatingMap = true;
            let mapName = this.form.controls["mapName"].value
            let teamId = this.form.controls["teamId"].value

            let newDataset = new DataSet({
                initiative: new Initiative({
                    name: mapName,
                    team_id: teamId,
                    children: [
                        new Initiative({
                            name: "This is your outer circle. A great place to put a short version of your mission or vision",
                            description: "This is the description of the circle. Use this to explain more about what this circle does and link out to other tools, systems and documents that you're using.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it.",
                            team_id: teamId,
                            id : Math.floor(Math.random() * 10000000000000),
                            children: [
                                new Initiative({
                                    name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                    description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                    team_id: teamId,
                                    id : Math.floor(Math.random() * 10000000000000),
                                }),
                                new Initiative({
                                    name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                    description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                    team_id: teamId,
                                    id : Math.floor(Math.random() * 10000000000000),
                                    children: [
                                        new Initiative({
                                            name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                            description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                            team_id: teamId,
                                            id : Math.floor(Math.random() * 10000000000000),
                                        }),
                                        new Initiative({
                                            name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                            description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                            team_id: teamId,
                                            id : Math.floor(Math.random() * 10000000000000),
                                        })
                                    ]
                                }),
                                new Initiative({
                                    name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                    description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                    team_id: teamId,
                                    id : Math.floor(Math.random() * 10000000000000),
                                }),
                            ]
                        })
                    ]
                })
            });
            this.datasetFactory.create(newDataset)
                .then((created: DataSet) => {
                    this.created.emit(created);
                    this.form.reset();

                    this.isCreatingMap = false;
                    this.cd.markForCheck();
                    return created
                })
                .then(created => {
                    this.intercom.trackEvent("Create map", { teamId: teamId, mapName: mapName });
                    return created;
                })
                .then(created => {
                    if (this.isRedirect) this.router.navigate(["map", created.datasetId, created.initiative.getSlug()]);
                })
                .catch(() => {

                });
        }
    }
}
