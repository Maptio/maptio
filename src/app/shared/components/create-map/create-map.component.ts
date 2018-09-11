import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatasetFactory } from '../../services/dataset.factory';
import { FormGroup, FormControl, Validators } from '../../../../../node_modules/@angular/forms';
import { Team } from '../../model/team.data';
import { DataSet } from '../../model/dataset.data';
import { Initiative } from '../../model/initiative.data';
import { Auth } from '../../services/auth/auth.service';
import { User } from '../../model/user.data';
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
    @Input("user") user: User;
    @Input("isRedirect") isRedirect:Boolean;

    @Output("close") close  = new EventEmitter<void>();
    @Output("created") created  = new EventEmitter<DataSet>();

    constructor(private datasetFactory: DatasetFactory, private auth: Auth, private analytics: Angulartics2Mixpanel,
        private router: Router) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            "mapName": new FormControl(this.teams.length > 1 ? "" : this.teams[0].name, [Validators.required, Validators.minLength(2)]),
            "teamId": new FormControl(this.teams.length > 1 ? null : this.teams[0].team_id, [Validators.required]),
        })
    }

    submit() {
        if (this.form.valid) {
            let mapName = this.form.controls["mapName"].value
            let teamId = this.form.controls["teamId"].value

            let newDataset = new DataSet({ initiative: new Initiative({ name: mapName, team_id: teamId }) });
            this.datasetFactory.create(newDataset)
                .then((created: DataSet) => {
                    this.user.datasets.push(created.datasetId)
                    this.auth.getUser();
                    // this.close.emit();
                    this.created.emit(created);
                    // this.isCreateMode = false;
                    // this.selectedDataset = created;
                    this.analytics.eventTrack("Create a map", { email: this.user.email, name: mapName, teamId: teamId })
                    this.form.reset();
                    // this.cd.markForCheck();
                    return created
                })
                .then(created => {
                    if(this.isRedirect) this.router.navigate(["map", created.datasetId, created.initiative.getSlug()]);
                })
                .catch(()=>{

                });
            // this.ngOnInit();
        }
    }
}
