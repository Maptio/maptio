import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DatasetFactory } from '../../services/dataset.factory';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Team } from '../../model/team.data';
import { DataSet } from '../../model/dataset.data';
import { Initiative } from '../../model/initiative.data';
import { Auth } from '../../services/auth/auth.service';
import { Angulartics2Mixpanel } from 'angulartics2';
import { Router } from '@angular/router';

@Component({
    selector: 'common-create-map',
    templateUrl: './create-map.component.html',
    styleUrls: ['./create-map.component.css']
})
export class CreateMapComponent implements OnInit {
    form: FormGroup;
    @Input("teams") teams: Team[];
    @Input("isRedirect") isRedirect: Boolean;

    @Output("close") close = new EventEmitter<void>();
    @Output("created") created = new EventEmitter<DataSet>();

    constructor(private datasetFactory: DatasetFactory, private auth: Auth, private analytics: Angulartics2Mixpanel,
        private router: Router) { }



    ngOnInit(): void {
        this.form = new FormGroup({
            "mapName": new FormControl("", [Validators.required, Validators.minLength(2)]),
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
            let mapName = this.form.controls["mapName"].value
            let teamId = this.form.controls["teamId"].value

            let newDataset = new DataSet({ initiative: new Initiative({ name: mapName, team_id: teamId }) });
            this.datasetFactory.create(newDataset)
                .then((created: DataSet) => {
                    this.created.emit(created);
                    this.form.reset();
                    return created
                })
                .then(created => {
                    if (this.isRedirect) this.router.navigate(["map", created.datasetId, created.initiative.getSlug()]);
                })
                .catch(() => {

                });
        }
    }
}
