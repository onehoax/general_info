import { inject, Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import type { Observable } from "rxjs";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";
import { AUTH_ERROR } from "@hexagonal/shared/domain/constants/error-codes.constant";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly router: Router = inject(Router);

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage: string = "";
        switch (error.status) {
          case AUTH_ERROR.UNAUTHORIZED.code:
            sessionStorage.clear();
            localStorage.removeItem("token");
            this.router.navigate(["/"]);
            errorMessage = AUTH_ERROR.UNAUTHORIZED.message;
            break;
          case AUTH_ERROR.FORBIDDEN.code:
            errorMessage = AUTH_ERROR.FORBIDDEN.message;
            break;
        }

        return throwError(() => new HttpErrorResponse({ error: new Error(errorMessage) }));
      }),
    );
  }
}
