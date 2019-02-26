import { Injectable } from "@angular/core";
import { NgProgress } from '@ngx-progressbar/core';


@Injectable()
export class LoaderService {
    public isLoading: boolean;

    constructor(public progress: NgProgress) {

    }


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