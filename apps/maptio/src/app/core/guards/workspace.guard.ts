import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
} from '@angular/router';
import { UIService } from '../../modules/workspace/services/ui.service';

@Injectable()
export class WorkspaceGuard implements CanActivate, CanActivateChild {
  constructor(private uiService: UIService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    this.uiService.clean();
    return true;
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(childRoute, state);
  }
}
