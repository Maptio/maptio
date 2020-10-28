import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Team } from '../../../model/team.data';
import { Permissions } from "../../../model/permission.data";
import { DataSet } from '../../../model/dataset.data';
import { Router } from '@angular/router';
import { Intercom } from 'ng-intercom';
import { MapService } from '../../../services/map/map.service';
import { environment } from "../../../../config/environment";

@Component({
    selector: 'common-create-map',
    templateUrl: './create-map.component.html',
    styleUrls: ['./create-map.component.css']
})
export class CreateMapComponent implements OnInit {
    form: FormGroup;
    isCreatingMap: Boolean;
    Permissions = Permissions;

    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

    @Input("teams") teams: Team[];
    @Input("isRedirect") isRedirect: Boolean;

    @Output("close") close = new EventEmitter<void>();
    @Output("created") created = new EventEmitter<DataSet>();

    constructor(private mapService:MapService, private cd: ChangeDetectorRef,
        private router: Router, private intercom: Intercom) { }



    ngOnInit(): void {
        this.form = new FormGroup({
            "mapName": new FormControl("", {
                validators: [Validators.required, Validators.minLength(2)],
                updateOn: "submit"
            }),
            "teamId": new FormControl(
                this.teams.length ==0
                ? null
                : this.teams.length > 1 
                    ? null 
                    : this.teams[0].team_id, 
                [Validators.required]),
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.teams && changes.teams.currentValue) {
            this.teams = changes.teams.currentValue.filter((t:Team)=>!t.isExample);
        }
    }

    submit() {
        if (this.form.valid) {
            this.isCreatingMap = true;
            let mapName = this.form.controls["mapName"].value
            let teamId = this.form.controls["teamId"].value

            this.mapService.createTemplate(mapName, teamId)
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
