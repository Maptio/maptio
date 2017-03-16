import { ErrorService } from "./error.service";
import { Router } from "@angular/router";
import { UserFactory } from "./user.factory";
import { Injectable } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";
import { UUID } from "angular2-uuid/index";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { User } from "../model/user.data";

declare var Auth0Lock: any;

@Injectable()
export class Auth {


  private _lock: any; // = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", {

  // });

  private user$: Subject<User>;



  /**
   * Store the URL so we can redirect after logging in
   */
  // redirectUrl: string;

  constructor(public userFactory: UserFactory, private router: Router, private errorService: ErrorService) {

    this.user$ = new Subject();
    this.getLock().on("authenticated", (authResult: any) => {
      localStorage.setItem("id_token", authResult.idToken);

      let pathname_object: any = JSON.parse(authResult.state);
      let pathname: any = localStorage.getItem(pathname_object.pathname_key) || "";
      localStorage.removeItem(pathname_object.pathname_key);

      this.getLock().getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          alert(error);
          return;
        }
        this.setUser(profile).then((isSucess: boolean) => {
          if (isSucess) {
            this.router.navigate([pathname], {})
              .catch((reason: any) => { errorService.handleError(reason) });
          }
          else {
            errorService.handleError("Something has gone wrong ! Try again ?");
          }
        });
        this.getLock().hide();
      });

    });
  }

  public setUser(profile: any): Promise<boolean> {
    localStorage.setItem("profile", JSON.stringify(profile));

    return this.userFactory.get(profile.user_id)
      .then((user) => {
        this.user$.next(user);
        return Promise.resolve<boolean>(true);
      }).
      catch((reason: any) => {
        let user = User.create().deserialize(profile);
        this.userFactory.upsert(user)
          .then(() => { return Promise.resolve<boolean>(true); })
          .catch(() => { return Promise.resolve<boolean>(false); });  // adds the user in the database
        this.user$.next(user);
        return Promise.resolve<boolean>(true);
      });
  }

  // FIXME : credentials should come from configuration service
  public getLock() {

    let options = {
      closable: true,
      theme: {
        logo: "assets/images/logo.png",
        primaryColor: "#b81b1c"
      },
      languageDictionary: {
        title: "Maptio"
      },
      auth: {
        redirectUrl: location.origin,
        responseType: "token",
      }
    };

    if (!this._lock)
      this._lock = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", options);


    return this._lock;
  }


  public login() {
    let uuid = UUID.UUID();
    localStorage.setItem(uuid, localStorage.getItem("redirectUrl"));
    this.getLock().show({
      auth: {
        params: {
          scope: "openid name email",
          state: JSON.stringify({ pathname_key: uuid })
        }
      }
    });
  };

  public authenticated() {
    return tokenNotExpired();
  }

  public logout() {
    localStorage.clear();
    this.clear();
  }

  public clear() {
    this.user$.next(undefined);
  }

  public getUser(): Observable<User> {
    let profileString = localStorage.getItem("profile");

    if (profileString) {
      this.userFactory.get(JSON.parse(profileString).user_id).then((user) => {
        this.user$.next(user)
      });
    }
    else {
      this.clear();
    }
    return this.user$.asObservable();
  }

}