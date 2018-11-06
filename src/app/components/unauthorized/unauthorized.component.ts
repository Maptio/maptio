import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Subscription, Observable } from "../../../../node_modules/rxjs";
import { Router } from "../../../../node_modules/@angular/router";

@Component({
    selector: "unauthorized",
    templateUrl: "./unauthorized.component.html"
})
export class UnauthorizedComponent implements OnInit {
    private timeToRedirect:number = 5;
    private subscription:Subscription;
    constructor(private cd:ChangeDetectorRef, private roouter:Router) { }

    ngOnInit() { 
        this.subscription = Observable.timer(1000, 1000).subscribe(i =>{
            this.timeToRedirect -= 1;
            this.cd.markForCheck();

            if(this.timeToRedirect ===0){
                this.roouter.navigateByUrl("/home");
            }
        })

    }

    ngOnDestroy(): void {
      if(this.subscription) this.subscription.unsubscribe();
    }
}