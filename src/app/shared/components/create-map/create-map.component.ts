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
        console.log(this.form)
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
                            name: "This is your map's outer circle. Right-click (ctrl+click on a Mac) to edit.",
                            team_id: teamId,
                            children: [
                                new Initiative({
                                    name: "This is a sub-circle",
                                    team_id: teamId,
                                }),
                                new Initiative({
                                    name: "Another sub-circle",
                                    team_id: teamId,
                                }),
                                new Initiative({
                                    name: "And one more sub-circle",
                                    team_id: teamId,
                                })
                            ]
                        })
                    ]
                })
            });
            this.datasetFactory.create(newDataset)
                .then((created: DataSet) => {
                    console.log(created)
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
