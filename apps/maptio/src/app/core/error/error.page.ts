import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';

import { timer } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
  selector: 'maptio-error-page',
  templateUrl: './error.page.html',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  @Input() iconName: string;
  @Input() errorHeadline: string;
  @Input() shouldRedirect = false;

  public timeToRedirect = 5;

  private subs = new SubSink();

  constructor(private cd: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    if (this.shouldRedirect) {
      this.subs.sink = timer(1000, 1000).subscribe(() => {
        this.timeToRedirect -= 1;
        this.cd.markForCheck();

        if (this.timeToRedirect === 0) {
          this.router.navigateByUrl('/home');
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
