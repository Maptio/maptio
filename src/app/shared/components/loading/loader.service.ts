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

    public isLoading: boolean;

    show() {
        this.progress.start();
        this.isLoading = true;
    }
    hide() {
        this.progress.done();
        this.isLoading = false;
    }
    keep() {
        this.progress.inc();
        this.isLoading = true;
    }
}