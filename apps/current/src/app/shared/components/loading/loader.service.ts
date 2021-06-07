import { Injectable } from "@angular/core";
// import { NgProgress, NgProgressRef } from '@ngx-progressbar/core';


@Injectable()
export class LoaderService {
  // private progressRef?: NgProgressRef;

  public isLoading = false;


  // constructor(private progress: NgProgress) {}
  constructor() {}


  // init() {
    // PROGRESSTODO:
    // if (this.progressRef) return;
    // this.progressRef = this.progress.ref('loader');
  // }

  show() {
    // this.init();
    // this.progressRef.start();
    // this.isLoading = true;
    console.log('loader placeholder: show');
  }

  hide() {
    // this.init();
    // this.progressRef.complete();
    // this.isLoading = false;
    console.log('loader placeholder: hide');
  }
}
