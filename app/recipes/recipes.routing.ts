import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RecipesComponent } from "./recipes.component";
import { AuthGuard } from "../auth-guard.service";

const recipesRoutes: Routes = [
  { path: "recipes", component: RecipesComponent, canActivate: [AuthGuard] },
];
export const recipesRouting: ModuleWithProviders = RouterModule.forChild(recipesRoutes);