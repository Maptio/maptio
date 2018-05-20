import { Team } from './../../../shared/model/team.data';
import { SlackIntegration } from './../../../shared/model/integrations.data';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from "@angular/core";
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "slack-share",
    templateUrl: "./slack.component.html",
    styleUrls: ["./slack.component.css"]
})
export class ShareSlackComponent {
    @Input("slack") slackIntegration: SlackIntegration;
    @Input("team") team: Team;
    @Input("isPrinting") isPrinting: boolean;
    @Input("hasNotified") hasNotified: boolean;

    @Output() shareMap: EventEmitter<string> = new EventEmitter<string>();

    message: string;
    showConfiguration: boolean;
    constructor(private cd: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log("changes", changes)
        if (changes.isPrinting || changes.hasNotified) {
            // console.log("here")
            this.updateTemplate();
        }
        else {
            if (changes.slackIntegration && changes.slackIntegration.currentValue && changes.slackIntegration.currentValue.access_token) {
                this.showConfiguration = false
            } else {
                this.showConfiguration = true
            }
        }
    }


    updateTemplate(){
        this.cd.markForCheck();
    }

    sendNotification() {
            this.shareMap.emit(this.message)
    }
}
