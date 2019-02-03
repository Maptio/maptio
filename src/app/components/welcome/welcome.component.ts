import { Component, OnInit } from '@angular/core';
import { Auth } from '../../shared/services/auth/auth.service';
import { Router } from '../../../../node_modules/@angular/router';
import { environment } from '../../../environment/environment';

@Component({
    selector: 'welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
    SCREENSHOT_URL = environment.SCREENSHOT_URL;
    SCREENSHOT_URL_FALLBACK = environment.SCREENSHOT_URL_FALLBACK;


    constructor(private auth:Auth, private router:Router) { }

    ngOnInit(): void { 
        if(this.auth.allAuthenticated()){
            this.router.navigateByUrl("/home")
        }
    }
}
