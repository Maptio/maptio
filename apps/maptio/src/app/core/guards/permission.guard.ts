import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Permissions } from '../../shared/model/permission.data';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';
import { Store } from '@ngrx/store';

import { AppState } from '@maptio-state/app.state';
import { setCurrentOrganisationId } from '@maptio-state/global.actions';

@Injectable()
export class PermissionGuard {
  constructor(
    private store: Store<AppState>,
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const currentOrganisationId: string = route.parent.paramMap.get('teamid');
    this.store.dispatch(setCurrentOrganisationId({ currentOrganisationId }));

    return this.permissionsService.userPermissions$.pipe(
      map((userPermissions) => {
        route.data.permissions.forEach((required: Permissions) => {
          if (!userPermissions.includes(required)) {
            this.router.navigate(['/unauthorized']);
          }
        });

        return true;
      })
    );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): Observable<boolean> {
    return this.canActivate(childRoute);
  }
}
