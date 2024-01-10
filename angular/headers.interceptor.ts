import { inject, Injectable } from "@angular/core";
import type { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { switchMap, type Observable, of } from "rxjs";
import { LocalStorageService } from "@lib/services/local-storage.service";

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token: string = this.localStorageService.getAccessToken();
    let request: HttpRequest<unknown> = req;

    if (token)
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          language: this.getUserLanguage(),
        },
      });

    return next.handle(request).pipe(
      switchMap((response: HttpEvent<unknown>) => {
        return of(response);
      }),
    );
  }

  private getUserLanguage(): string {
    const language: string | null = this.localStorageService.getLanguage();
    if (language) {
      return language;
    }
    return navigator.language.split("-")[0];
  }
}
