import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { timer } from 'rxjs';
import { SubSink } from 'subsink';


@Component({
  selector: 'maptio-error-page',
  templateUrl: './error.page.html',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  public timeToRedirect = 5;

  private subs = new SubSink();

  constructor(private cd: ChangeDetectorRef, private roouter: Router) {}

  ngOnInit() {
    this.subs.sink = timer(1000, 1000).subscribe(() => {
      this.timeToRedirect -= 1;
      this.cd.markForCheck();

      if (this.timeToRedirect === 0) {
        this.roouter.navigateByUrl('/home');
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
