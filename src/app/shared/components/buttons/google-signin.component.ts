import { Component, OnInit } from '@angular/core';
import { Auth } from '../../../core/authentication/auth.service';

@Component({
    selector: 'common-google-signin',
    templateUrl: './google-signin.component.html',
    styleUrls: ['./google-signin.component.css']
})
export class GoogleSignInComponent implements OnInit {
    constructor(private auth:Auth) { }

    ngOnInit(): void { }

    signIn(){
        this.auth.googleSignIn();
    }
}
