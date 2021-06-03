import { ErrorHandler, Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable()
export class HttpLogInterceptor implements HttpInterceptor {
  constructor(
    private errorHandler: ErrorHandler,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(response => this.handleError(response))
    );
  }

  public handleError = (error: HttpErrorResponse) => {
    if (this.isUnauthorized(error.status)) {
      this.router.navigateByUrl("/logout");
    }

    this.errorHandler.handleError(error);

    return throwError(error);
  }

  private isUnauthorized(status: number): boolean {
    return status === 0 || status === 401;
  }
}
