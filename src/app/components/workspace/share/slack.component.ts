import { Team } from './../../../shared/model/team.data';
import { SlackIntegration } from './../../../shared/model/integrations.data';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { SimpleChanges } from '@angular/core';
import { ExportService } from './../../../shared/services/export/export.service';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'slack-share',
    templateUrl: './slack.component.html',
    styleUrls: ['./slack.component.css']
})
export class ShareSlackComponent implements OnInit {
    @Input("slack") slackIntegration: SlackIntegration;
    @Input("team") team: Team;
    @Input("isPrinting") isPrinting: boolean;

    @Output() shareMap: EventEmitter<string> = new EventEmitter<string>();

    channels: Array<any>;

    // selectedChannel: any;
    message: string;
    showConfiguration: boolean;
    constructor(private cd: ChangeDetectorRef, private exportService: ExportService) { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes)
        if (changes.isPrinting) {
            this.cd.markForCheck();
        }
        else{
            if (changes.slackIntegration && changes.slackIntegration.currentValue && changes.slackIntegration.currentValue.access_token) {
                this.showConfiguration = false
            } else {
                this.showConfiguration = true
            }
        }
        
    }

    sendNotification() {
        this.shareMap.emit(this.message)
    }
}
