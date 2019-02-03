import { Component, OnInit } from '@angular/core';
import { Auth } from '../../shared/services/auth/auth.service';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
    selector: 'welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
    constructor(private auth:Auth, private router:Router) { }

    ngOnInit(): void { 
        if(this.auth.allAuthenticated()){
            this.router.navigateByUrl("/home")
        }
    }
}
