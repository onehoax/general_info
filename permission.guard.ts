import { Injectable, inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { PermissionService } from "@hexagonal/main/permission/application/permission.service";
import { PermissionData } from "@hexagonal/main/permission/domain/permission.data";
import { RoleService } from "@hexagonal/main/role/application/role.service";
import { RoleData } from "@hexagonal/main/role/domain/role.data";
import { UserService } from "@hexagonal/main/user/application/user.service";
import { UserData } from "@hexagonal/main/user/domain/user.data";
import { LocalStorageService } from "@lib/services/local-storage.service";
import { Observable, firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PermissionGuard {
  private readonly router: Router = inject(Router);
  private readonly userService: UserService = inject(UserService);
  private readonly roleService: RoleService = inject(RoleService);
  private readonly permissionService: PermissionService = inject(PermissionService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  private hasPermission(module: string, user: UserData, permissions: PermissionData[]): boolean {
    if (!user) return false;
    return user.isSuperUser || this.hasModulePermission(module, permissions);
  }

  private hasModulePermission(module: string, permissions: PermissionData[]): boolean {
    return permissions.some((permission: PermissionData): boolean => permission.module! === module);
  }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree> {
    const currentUser: UserData = (
      await firstValueFrom(this.userService.getById(this.localStorageService.getUserId()))
    ).data;
    const userRole: RoleData = (await firstValueFrom(this.roleService.findById(currentUser.role!)))
      .data;
    const rolePermissions: PermissionData[] = (
      await firstValueFrom(this.permissionService.findManyById(userRole.permissions!))
    ).data;

    const moduleName: string = route.data["module"];

    if (!this.hasPermission(moduleName, currentUser, rolePermissions)) {
      await this.router.navigate(["/admin"]);
      return false;
    }

    return true;
  }
}
