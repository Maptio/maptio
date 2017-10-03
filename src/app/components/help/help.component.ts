import { Angulartics2Mixpanel } from "angulartics2";
import { Component, ViewChild, OnInit } from "@angular/core";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
    selector: "help",
    templateUrl: "./help.component.html"
})
export class HelpComponent implements OnInit {

    constructor(private analytics: Angulartics2Mixpanel

    ) { }

    ngOnInit() {
        this.analytics.eventTrack("Open help", {})
    }

}