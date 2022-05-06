import { environment } from '../../../../config/environment';
import { Component, OnInit } from "@angular/core";
import { User } from '../../../../shared/model/user.data';
import { Subscription } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { UserService } from '@maptio-shared/services/user/user.service';

@Component({
    selector: "help",
    templateUrl: "./help.page.html"
})
export class HelpComponent implements OnInit {

    KB_URL_HOME = environment.KB_URL_HOME;
    user:User;
    subscription:Subscription;

    constructor(
        private intercom: Intercom,
        private userService: UserService,
    ) { }

    ngOnInit() {
        this.subscription = this.userService.user$.subscribe(user =>{
            this.user = user;
        })
    }

    ngOnDestroy(): void {
        if(this.subscription) this.subscription.unsubscribe();
    }

    openIntercom(){
        this.intercom.show();
    }

}
