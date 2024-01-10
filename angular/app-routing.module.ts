import { NgModule } from "@angular/core";
import type { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";
import { LoginGuard } from "@lib/guards/login.guard";
import { TokenGuard } from "@lib/guards/token.guard";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/auth/auth-routing.module").then((m) => m.AuthRoutingModule),
        canActivate: [LoginGuard],
      },
    ],
  },
  {
    path: "admin",
    loadChildren: () => import("./features/main/main.module").then((m) => m.MainModule),
    canActivate: [TokenGuard],
  },
  {
    path: "**",
    pathMatch: "full",
    redirectTo: "",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
