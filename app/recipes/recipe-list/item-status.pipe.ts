import { Pipe, PipeTransform } from "@angular/core";

import { Recipe } from "../shared";

@Pipe({
  name: "itemStatus"
})
export class ItemStatusPipe implements PipeTransform {
  value: Array<Recipe> = [];
  transform(items: Array<Recipe>, deleted: boolean) {
    if (items instanceof Array) {
      this.value = items.filter((recipe: Recipe) => {
        return recipe.deleted === deleted;
      });
    }
    return this.value;
  }
}