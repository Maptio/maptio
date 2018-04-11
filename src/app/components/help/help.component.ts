import { environment } from './../../../environment/environment';
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "help",
    templateUrl: "./help.component.html"
})
export class HelpComponent implements OnInit {

    KB_URL_HOME = environment.KB_URL_HOME;

    constructor(
    ) { }

    ngOnInit() {
    }

}