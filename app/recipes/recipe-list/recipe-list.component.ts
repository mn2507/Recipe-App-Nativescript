import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
} from "@angular/core";

import { Recipe, RecipeService } from "../shared";
import { alert } from "../../shared";

declare var UIColor: any;

@Component({
  selector: "rp-recipe-list",
  moduleId: module.id,
  templateUrl: "./recipe-list.component.html",
  styleUrls: ["./recipe-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeListComponent implements AfterViewInit {
  @Input() showDeleted: boolean;
  @Input() row;
  @Output() loading = new EventEmitter();
  @Output() loaded = new EventEmitter();

  public store: RecipeService;
  listLoaded = false;

  constructor(store: RecipeService) {
    this.store = store;
  }
  ngAfterViewInit() {
    this.load();
  }
  load() {
    this.loading.next("");
    this.store.load().subscribe(
      () => {
        this.loaded.next("");
        this.listLoaded = true;
      },
      () => {
        alert("An error occurred loading your recipe list.");
      }
    );
  }

  // The following trick makes the background color of each cell
  // in the UITableView transparent as it’s created.
  makeBackgroundTransparent(args) {
    let cell = args.ios;
    if (cell) {
      // support XCode 8
      cell.backgroundColor = UIColor.clearColor;
    }
  }

  imageSource(recipe) {
    if (recipe.deleted) {
      return "res://add";
    }
    return recipe.done ? "res://checked" : "res://unchecked";
  }

  toggleDone(recipe: Recipe) {
    if (recipe.deleted) {
      this.store.unsetDeleteFlag(recipe).subscribe(
        () => {},
        () => {
          alert("An error occurred managing your recipe list.");
        }
      );
    } else {
      this.store.toggleDoneFlag(recipe).subscribe(
        () => {},
        () => {
          alert("An error occurred managing your recipe list.");
        }
      );
    }
  }

  delete(recipe: Recipe) {
    this.loading.next("");
    let successHandler = () => this.loaded.next("");
    let errorHandler = () => {
      alert("An error occurred while deleting an item from your list.");
      this.loaded.next("");
    };

    if (recipe.deleted) {
      this.store
        .permanentlyDelete(recipe)
        .subscribe(successHandler, errorHandler);
    } else {
      this.store.setDeleteFlag(recipe).subscribe(successHandler, errorHandler);
    }
  }
}
