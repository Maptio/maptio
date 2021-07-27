import { environment } from '../../../../config/environment';
import { Component, OnInit } from "@angular/core";
import { InstructionsService } from '../../../../shared/components/instructions/instructions.service';
import { User } from '../../../../shared/model/user.data';
import { Auth } from '../../../../core/authentication/auth.service';
import { Subscription } from 'rxjs';
import { Intercom } from 'ng-intercom';

@Component({
    selector: "help",
    templateUrl: "./help.page.html"
})
export class HelpComponent implements OnInit {

    KB_URL_HOME = environment.KB_URL_HOME;
    user:User;
    subscription:Subscription;
    
    constructor(private auth:Auth , private instructions:InstructionsService, private intercom:Intercom) { }

    ngOnInit() {
        this.subscription = this.auth.getUser().subscribe(user =>{
            this.user = user;
        })
    }

    ngOnDestroy(): void {
        if(this.subscription) this.subscription.unsubscribe();
    }
    
    openTutorial(){
        this.instructions.openTutorial(this.user);
    }

    openIntercom(){
        this.intercom.show();
    }

}