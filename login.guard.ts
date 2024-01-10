import type { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Router } from "@angular/router";
import { inject, Injectable } from "@angular/core";
import type { Observable } from "rxjs";
import { LocalStorageService } from "@lib/services/local-storage.service";

@Injectable({
  providedIn: "root",
})
export class LoginGuard {
  private readonly router: Router = inject(Router);

  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree> {
    const token: string | null = this.localStorageService.getAccessToken();

    if (token) {
      await this.router.navigate(["/admin"]);
      return false;
    }
    return true;
  }
}
