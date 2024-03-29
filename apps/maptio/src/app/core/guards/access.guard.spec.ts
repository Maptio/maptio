import { of as observableOf, Observable } from 'rxjs';
import { AccessGuard } from './access.guard';
import { ErrorService } from '../../shared/services/error/error.service';
import { Http, BaseRequestOptions } from '@angular/http';
import { UserFactory } from '../http/user/user.factory';
import { TestBed, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { User } from '../../shared/model/user.data';
import { Auth } from '../authentication/auth.service';
import { Intercom, IntercomConfig } from '@supy-io/ngx-intercom';

export class AuthStub {
  getUser() {}
}

import {
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';

describe('access.guard.ts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccessGuard,
        UserFactory,
        ErrorService,
        Intercom,
        IntercomConfig,
        { provide: Auth, useClass: AuthStub },
        {
          provide: Router,
          useClass: class {
            navigate = jest.fn();
          },
        },
        {
          provide: Http,
          useFactory: (
            mockBackend: MockBackend,
            options: BaseRequestOptions
          ) => {
            return new Http(mockBackend, options);
          },
          deps: [MockBackend, BaseRequestOptions],
        },
        {
          provide: ActivatedRouteSnapshot,
          useClass: class {},
        },
        {
          provide: RouterStateSnapshot,
          useClass: class {},
        },
        MockBackend,
        BaseRequestOptions,
      ],
    });

    localStorage.clear();
  });

  describe('canActivate', () => {
    it('should return true when user is authorized to access a given workspace', inject(
      [AccessGuard, Auth, Router],
      (target: AccessGuard, mockAuth: AuthStub, mockRouter: Router) => {
        const route = TestBed.get(ActivatedRouteSnapshot);
        route.params = {
          mapid: 'id1',
        };

        const state = TestBed.get(RouterStateSnapshot);

        const spyAuth = spyOn(mockAuth, 'getUser').and.returnValue(
          observableOf<User>(
            new User({
              name: 'John Doe',
              datasets: ['id1', 'id2'],
              teams: ['t1', 't2'],
              exampleTeamIds: ['t1'],
            })
          )
        );

        target
          .canActivate(route, state)
          .toPromise()
          .then((result) => {
            expect(result).toBe(true);
            expect(spyAuth).toHaveBeenCalled();
          });
      }
    ));

    it('should return true when user is authorized to access a given team', inject(
      [AccessGuard, Auth, Router],
      (target: AccessGuard, mockAuth: AuthStub, mockRouter: Router) => {
        const route = TestBed.get(ActivatedRouteSnapshot);
        route.params = {
          teamid: 'team1',
        };

        const state = TestBed.get(RouterStateSnapshot);

        const spyAuth = spyOn(mockAuth, 'getUser').and.returnValue(
          observableOf<User>(
            new User({
              name: 'John Doe',
              teams: ['team1', 'team2'],
              exampleTeamIds: ['team1'],
            })
          )
        );

        target
          .canActivate(route, state)
          .toPromise()
          .then((result) => {
            expect(result).toBe(true);
            expect(spyAuth).toHaveBeenCalled();
          });
      }
    ));

    it('should return false when user is not authorized to a workspace then redirect to /unauthorized', inject(
      [AccessGuard, Auth, Router],
      (target: AccessGuard, mockAuth: AuthStub, mockRouter: Router) => {
        const route = TestBed.get(ActivatedRouteSnapshot);
        route.params = {
          mapid: 'id3',
        };

        const state = TestBed.get(RouterStateSnapshot);

        const spyAuth = spyOn(mockAuth, 'getUser').and.returnValue(
          observableOf<User>(
            new User({ name: 'John Doe', datasets: ['id1', 'id2'] })
          )
        );

        target
          .canActivate(route, state)
          .toPromise()
          .then((result) => {
            expect(result).toBe(false);
            expect(spyAuth).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
          });
      }
    ));

    it('should return false when user is not authorized to a team then redirect to /unauthorized', inject(
      [AccessGuard, Auth, Router],
      (target: AccessGuard, mockAuth: AuthStub, mockRouter: Router) => {
        const route = TestBed.get(ActivatedRouteSnapshot);
        route.params = {
          teamid: 'team3',
        };

        const state = TestBed.get(RouterStateSnapshot);

        const spyAuth = spyOn(mockAuth, 'getUser').and.returnValue(
          observableOf<User>(
            new User({
              name: 'John Doe',
              teams: ['team1', 'team2'],
              exampleTeamIds: ['team1'],
            })
          )
        );

        target
          .canActivate(route, state)
          .toPromise()
          .then((result) => {
            expect(result).toBe(false);
            expect(spyAuth).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
          });
      }
    ));
  });
});
