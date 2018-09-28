import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { URIService } from '../../shared/services/uri.service';
import { JwtHelper } from 'angular2-jwt';
import { AuthConfiguration } from '../../shared/services/auth/auth.config';

@Component({
    selector: 'authorize',
    template: ''
})
export class AuthorizeComponent implements OnInit {

    subscription: Subscription;
    constructor(private route:ActivatedRoute, private router:Router,  private uriService:URIService, private authConfig:AuthConfiguration) { }

    ngOnInit(): void {
        // http://localhost:3000/authorize#access_token=3nzTXjxsDE5E6EDX2NF7xBv3QfyECqP3&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNhZml5eWEuc2JAZ21haWwuY29tIiwibmFtZSI6InNhZml5eWEuc2JAZ21haWwuY29tIHNhZml5eWEuc2JAZ21haWwuY29tIiwidXNlcl9tZXRhZGF0YSI6e30sInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83MDFkNTdhZDY0NmI2YjIzYWQ5MGUyNjY1MWQxODhlND9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnNzLnBuZyIsIm5pY2tuYW1lIjoic2FmaXl5YS5zYiIsImxhc3RfcGFzc3dvcmRfcmVzZXQiOiIyMDE4LTAxLTI2VDE3OjQ2OjI5LjEzMVoiLCJhcHBfbWV0YWRhdGEiOnt9LCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidXNlcl9pZCI6ImF1dGgwfDVhNmI2OTJkOWUyNDM3MWJjZWQ3MzNkZiIsImNsaWVudElEIjoiQ1J2RjgyaElEMmxOSU1LNGVpMndEejIwTEg3UzVCTXkiLCJpZGVudGl0aWVzIjpbeyJ1c2VyX2lkIjoiNWE2YjY5MmQ5ZTI0MzcxYmNlZDczM2RmIiwicHJvdmlkZXIiOiJhdXRoMCIsImNvbm5lY3Rpb24iOiJVc2VybmFtZS1QYXNzd29yZC1BdXRoZW50aWNhdGlvbiIsImlzU29jaWFsIjpmYWxzZX0seyJwcm9maWxlRGF0YSI6eyJlbWFpbCI6InNhZml5eWEuc2JAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJTYWZpeXlhIFNCIiwiZ2l2ZW5fbmFtZSI6IlNhZml5eWEiLCJmYW1pbHlfbmFtZSI6IlNCIiwicGljdHVyZSI6Imh0dHBzOi8vbGg2Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tdldoRm1CZEZ5amMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBVXcvZUV4M2pVWW5YcncvcGhvdG8uanBnIiwiZ2VuZGVyIjoiZmVtYWxlIiwibG9jYWxlIjoiZW4tR0IifSwicHJvdmlkZXIiOiJnb29nbGUtb2F1dGgyIiwidXNlcl9pZCI6IjEwODQ3ODg4OTI4NzgzMTQ2MTc0OSIsImNvbm5lY3Rpb24iOiJnb29nbGUtb2F1dGgyIiwiaXNTb2NpYWwiOnRydWV9XSwidXBkYXRlZF9hdCI6IjIwMTgtMDktMjdUMTI6MzU6MDAuMjA4WiIsImNyZWF0ZWRfYXQiOiIyMDE4LTAxLTI2VDE3OjQ1OjE3LjYyM1oiLCJpc3MiOiJodHRwczovL2NpcmNsZW1hcHBpbmcuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVhNmI2OTJkOWUyNDM3MWJjZWQ3MzNkZiIsImF1ZCI6IkNSdkY4MmhJRDJsTklNSzRlaTJ3RHoyMExIN1M1Qk15IiwiaWF0IjoxNTM4MDUxNzAwLCJleHAiOjE1NDA2NDM3MDB9.VwFxZh3gi0SMCtSqKQzmMhAuQhZF0Z5WG71hXevHb3U&scope=profile%20email%20openid%20api%20invite&expires_in=86400&token_type=Bearer&state=8L~8nXQiEUpeV2Me59Vmm2RUwxFX.6q-
        this.subscription = this.route.fragment
        .map(fragment => this.uriService.parseFragment(fragment).get("id_token"))
        .do(token =>{
            localStorage.setItem("id_token", token)
        })
        .do(()=>{
            this.authConfig.getAccessToken()
        })
        .map(token =>  new JwtHelper().decodeToken(token))
        .subscribe(profile => {
            localStorage.setItem("profile",JSON.stringify(profile));
            this.router.navigateByUrl("/home")

        })
    }
}
