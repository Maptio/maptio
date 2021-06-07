import { Injectable } from "@angular/core";
import { NgProgress, NgProgressRef } from '@ngx-progressbar/core';


@Injectable()
export class LoaderService {
  progressRef?: NgProgressRef;
  isLoading = false;

  constructor(private progress: NgProgress) {}

  init() {
    if (this.progressRef) return;
    this.progressRef = this.progress.ref('loader');
  }

  show() {
    this.init();
    this.progressRef.start();
    this.isLoading = true;
  }

  hide() {
    this.init();
    this.progressRef.complete();
    this.isLoading = false;
  }
}
