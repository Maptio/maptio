import { Observable, of } from 'rxjs';
import { Permissions } from '../../shared/model/permission.data';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const userPermissions = this.permissionsService.getUserPermissions();

    route.data.permissions.forEach((required: Permissions) => {
      if (!userPermissions.includes(required)) {
        this.router.navigate(['/unauthorized']);
      }
    });

    return of(true);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): Observable<boolean> {
    return this.canActivate(childRoute);
  }
}
