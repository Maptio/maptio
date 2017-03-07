import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { HelpComponent } from './../help/help.component';
import { DatasetFactory } from './../../shared/services/dataset.factory';
import { DataSet } from './../../shared/model/dataset.data';
import { Input } from '@angular/core';
import { User } from './../../shared/model/user.data';
import { Auth } from './../../shared/services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'header',
    template: require("./header.component.html"),
    providers: [Auth],
})



export class HeaderComponent implements OnInit {
    @Input("user") user: User;

    @Input("currentDataset") currentDataset: DataSet;

    @Output("openHelp") openHelpEvent = new EventEmitter<void>();

    @Output("openDataset") openDatasetEvent = new EventEmitter<DataSet>();

    private datasets$: Promise<Array<DataSet>>;

    constructor(private auth: Auth, private datasetFactory: DatasetFactory) { }

    ngOnInit() {
        this.auth.getUser().subscribe(
            (user: User) => {
                this.user = user;
                this.datasetFactory.get(this.user).then(o => {
                    this.datasets$ = Promise.resolve(o);
                    this.datasets$.then((datasets: DataSet[]) => {
                        (datasets || []).forEach(function (d: DataSet, i: number, set: DataSet[]) {
                            this.datasetFactory.get(d.id).then((resolved: DataSet) => {
                                set[i] = resolved;
                            }
                            );
                        }.bind(this));

                    },
                        (reason: any) => { console.log("REASON IS " + reason) }
                    )
                },
                    (reason: any) => { console.log("REASON IS " + reason) })
            },
            (error: any) => { console.log(error) }
        );
    }

    openHelp() {
        this.openHelpEvent.emit();
    }

    openDataset(dataset:DataSet){
        this.openDatasetEvent.emit(dataset);
    }

}