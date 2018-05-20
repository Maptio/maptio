import { Team } from "./../../../../shared/model/team.data";
import { DataSet } from "./../../../../shared/model/dataset.data";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "team-single-maps",
    templateUrl: "./maps.component.html",
    styleUrls: ["./maps.component.css"]
})
export class TeamMapsComponent implements OnInit {

    public datasets: DataSet[];

    constructor(private route: ActivatedRoute) {

    }
    ngOnInit() {
        this.route.parent.data
            .subscribe((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                this.datasets = data.assets.datasets
            });
    }

    archiveMap(dataset: DataSet) {
console.log("archive", dataset.initiative.name)
    }

}