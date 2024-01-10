import { inject, Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Router } from "@angular/router";
import type { Observable } from "rxjs";
import { LocalStorageService } from "@lib/services/local-storage.service";

@Injectable({
  providedIn: "root",
})
export class TokenGuard {
  private readonly router: Router = inject(Router);

  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree> {
    const token: string | null = this.localStorageService.getAccessToken();

    if (!token) {
      sessionStorage.clear();
      this.localStorageService.removeAccessToken();
      await this.router.navigate(["/"]);
      return false;
    }
    return true;
  }
}
