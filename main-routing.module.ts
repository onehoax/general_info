import { NgModule } from "@angular/core";
import type { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";
import { environment } from "@env/environment.prod";
import { RedirectComponent } from "@features/shared/components/redirect/redirect.component";
import { MainComponent } from "./main.component";
import { PermissionGuard } from "@lib/guards/permission.guard";
import { PermissionModuleEnum } from "@hexagonal/main/permission/domain/enum/permission-module.enum";

const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadChildren: () =>
          import("./components/dashboard/dashboard-routing.module").then(
            (module) => module.DashboardRoutingModule,
          ),
        title: "Dashboard",
      },
      {
        path: "users",
        loadChildren: () =>
          import("./components/users/users-routing.module").then(
            (module) => module.UsersRoutingModule,
          ),
        canActivate: [PermissionGuard],
        title: "User",
        data: {
          module: PermissionModuleEnum.USER,
        },
      },
      {
        path: "roles",
        loadChildren: () =>
          import("./components/roles/roles-routing.module").then(
            (module) => module.RolesRoutingModule,
          ),
        canActivate: [PermissionGuard],
        title: "Role",
        data: {
          module: PermissionModuleEnum.ROLE,
        },
      },
      {
        path: "cms",
        component: RedirectComponent,
        canActivate: [PermissionGuard],
        title: "CMS",
        data: {
          module: PermissionModuleEnum.CMS,
          externalUrl: environment.CMS_APP,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
