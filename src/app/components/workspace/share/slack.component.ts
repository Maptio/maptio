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
    @Input("isPrinting") isPrinting: boolean;

    @Output() shareMap: EventEmitter<string> = new EventEmitter<string>();

    channels: Array<any>;

    // selectedChannel: any;
    message: string;

    constructor(private cd: ChangeDetectorRef, private exportService: ExportService) { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isPrinting && changes.isPrinting.currentValue) {
            this.cd.markForCheck();
        }
    }

    // selectChannel(event: NgbTypeaheadSelectItemEvent) {
    //     console.log(event.item);
    //     this.selectedChannel = event.item;
    // }

    sendNotification() {
        // console.log(this.message, this.selectedChannel);
        this.shareMap.emit(this.message)
    }

    // filter(term: string) {
    //     return this.channels.filter(
    //         v =>
    //             v.name.toLowerCase().indexOf(term.toLowerCase()) > -1
    //     ).slice(0, 10);
    // }

    // getChannels = (text$: Observable<string>) =>
    //     text$
    //         .debounceTime(200)
    //         .distinctUntilChanged()
    //         .map(search => {
    //             return search === ""
    //                 ? this.channels
    //                 : this.filter(search)
    //         })

    // formatter = (result: any) => {
    //     return result.name;
    // };
}
