import { Team } from '../../../../shared/model/team.data';
import { SlackIntegration } from '../../../../shared/model/integrations.data';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { ChangeDetectorRef } from "@angular/core";
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { SlackService } from './slack.service';
import { DataSet } from '../../../../shared/model/dataset.data';
import { saveAs } from "file-saver"
import { ExportService } from '../../../../shared/services/export/export.service';
import { reject } from 'lodash-es';
import { Intercom } from 'ng-intercom';

@Component({
    selector: "slack-share",
    templateUrl: "./slack.component.html",
    styleUrls: ["./slack.component.css"]
})
export class ShareSlackComponent {
    @Input("team") team: Team;
    @Input("dataset") dataset: DataSet;
    @Input("members") members: User[];
    @Input("isPrinting") isPrinting: boolean;
    @Input("hasNotified") hasNotified: boolean;
    @Input("hasConfigurationError") hasConfigurationError: boolean;

    // @Output() shareMap: EventEmitter<string> = new EventEmitter<string>();

    message: string;
    width: number;
    height: number;
    showConfiguration: boolean;
    pngImage: string;
    isLoading: boolean;
    constructor(private cd: ChangeDetectorRef, private slackService: SlackService, private exportService: ExportService, private intercom:Intercom) { }

 


    updateTemplate() {
        this.cd.markForCheck();
    }

    ngOnInit() {
        console.log("ngOnInit slack ", this.members);
        setTimeout(() => {
            this.isLoading = true;
            this.cd.markForCheck();
            this.getPreviewImage().then((png) => {
                this.pngImage = png;
                this.isLoading = false;
                this.cd.markForCheck();
            })
        }, 500)

    }


    getPreviewImage(): Promise<string> {

        return new Promise((resolve, reject) => {

            let svg: HTMLElement = document.querySelector("svg#map");
            svg.style.overflow = "hidden";

            this.width = svg.getBoundingClientRect().width + 20;
            this.height = svg.getBoundingClientRect().height + 20;

            let styledSvg = this.slackService.downloadSvg(svg, this.members);

            var svgString = new XMLSerializer().serializeToString(styledSvg);

            var canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            var context = canvas.getContext("2d");
            var DOMURL = self.URL || self.webkitURL || self;
            var img = new Image();
            var format = 'png';

            var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

            img.onload = function () {
                context.clearRect(0, 0, this.width, this.height);
                context.drawImage(img, 0, 0);
                var png = canvas.toDataURL("image/png");
                document.querySelector('#preview-container').innerHTML = '<img class="preview"  width="100%" height="100%" style="object-fit:cover;object-position:left" src="' + png + '"/>';
                DOMURL.revokeObjectURL(png);
                resolve(png);
            };
            img.src = imgsrc;

        });
    }

    sendNotification() {
        this.isPrinting = true;
        this.hasNotified = false;
        this.hasConfigurationError = false;
        this.cd.markForCheck();

        this.exportService.sendSlackNotification(this.pngImage, this.dataset.datasetId, this.dataset.initiative,
            this.team.slack, this.message)
            .subscribe((result) => {
                this.isPrinting = false;
                this.hasNotified = true;
                this.intercom.trackEvent("Sharing map", { team: this.team.name, teamId: this.team.team_id, datasetId: this.dataset.datasetId, mapName: this.dataset.initiative.name });

                this.cd.markForCheck()
            },
                (err) => {
                    this.hasConfigurationError = true;
                    this.cd.markForCheck();
                })
    }
}
