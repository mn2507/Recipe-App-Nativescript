import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { recipesRouting } from "./recipes.routing";
import { RecipesComponent } from "./recipes.component";
import { RecipeListComponent } from "./recipe-list/recipe-list.component";
import { ItemStatusPipe } from "./recipe-list/item-status.pipe";

@NgModule({
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    recipesRouting,
  ],
  declarations: [
    RecipesComponent,
    RecipeListComponent,
    ItemStatusPipe
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class RecipesModule {}
