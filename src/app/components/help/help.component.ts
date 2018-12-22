import { environment } from './../../../environment/environment';
import { Component, OnInit } from "@angular/core";
import { InstructionsService } from '../../shared/components/instructions/instructions.service';
import { User } from '../../shared/model/user.data';
import { Auth } from '../../shared/services/auth/auth.service';
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
    selector: "help",
    templateUrl: "./help.component.html"
})
export class HelpComponent implements OnInit {

    KB_URL_HOME = environment.KB_URL_HOME;
    user:User;
    subscription:Subscription;
    
    constructor(private auth:Auth , private instructions:InstructionsService) { }

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

}