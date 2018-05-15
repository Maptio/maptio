import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { SimpleChanges } from '@angular/core';
import { ExportService } from './../../../shared/services/export/export.service';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Input } from '@angular/core';
import { Team } from './../../../shared/model/team.data';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'slack-share',
    templateUrl: './slack.component.html',
    styleUrls: ['./slack.component.css']
})
export class ShareSlackComponent implements OnInit {
    @Input("team") team: Team;
    @Output() shareMap: EventEmitter<{ message: string, channelId: string }> = new EventEmitter<{ message: string, channelId: string }>();

    channels: Array<any>;

    selectedChannel: any;
    message: string;

    constructor(private cd: ChangeDetectorRef, private exportService: ExportService) { }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.team && changes.team.currentValue) {
            this.exportService.getSlackChannels(this.team.slack).subscribe(channels => this.channels = channels)

        }
    }

    selectChannel(event: NgbTypeaheadSelectItemEvent) {
        console.log(event.item);
        this.selectedChannel = event.item;
    }

    sendNotification() {
        console.log(this.message, this.selectedChannel);
        this.shareMap.emit({ message: this.message, channelId: this.selectedChannel.id })
    }

    filter(term: string) {
        return this.channels.filter(
            v =>
                v.name.toLowerCase().indexOf(term.toLowerCase()) > -1
        ).slice(0, 10);
    }

    getChannels = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(search => {
                return search === ""
                    ? this.channels
                    : this.filter(search)
            })

    formatter = (result: any) => {
        return result.name;
    };
}
