import { ErrorHandler, Injectable, Inject } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Auth } from '../authentication/auth.service';


@Injectable()
export class HttpLogInterceptor implements HttpInterceptor {
  constructor(
    private errorHandler: ErrorHandler,
    private router: Router,
    private authService: Auth,
    @Inject(DOCUMENT) private document: Document
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(response => this.handleError(request, response))
    );
  }

  public handleError = (request: HttpRequest<any>, error) => {
    if(this.checkIfRequestToSameDomain(request)) {
      return this.handleApiError(error);
    } else {
      if (this.isUnauthorized(error.status)) {
        this.router.navigateByUrl("/logout");
      }

      this.errorHandler.handleError(error);

      return throwError(error);
    }
  }

  private checkIfRequestToSameDomain(request: HttpRequest<any>): boolean {
    const requestUrl: URL = new URL(request.url, this.document.location.origin);

    if (requestUrl.host === this.document.location.host) {
      return true;
    } else {
      return false;
    }
  }

  private handleApiError(error) {
    if (!this.authService.internalApiAuthenticated()) {
      this.router.navigateByUrl("login?login_message=Your session expired, please log back in.");
      return EMPTY;
    } else if (this.isUnauthorized(error.status)) {
      this.router.navigateByUrl("/unauthorized");

      if (error instanceof HttpErrorResponse) {
        return throwError(error.message || "backend server error");
      }

      return EMPTY;
    } else {
      return throwError(error);
    }
  }

  private isUnauthorized(status: number): boolean {
    return status === 0 || status === 401 || status === 403;
  }
}
