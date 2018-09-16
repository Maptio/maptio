import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { NgProgress } from '@ngx-progressbar/core';

export interface LoaderState {
    show: boolean;
}

@Injectable()
export class LoaderService {
    private loaderSubject = new Subject<LoaderState>();
    loaderState = this.loaderSubject.asObservable();

    constructor(public progress: NgProgress) {

    }

    show() {
        this.progress.start()
    }
    hide() {
        this.progress.done()
    }
    keep(){
        this.progress.inc();
    }
}