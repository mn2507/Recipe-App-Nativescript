import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { action } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { TextField } from "tns-core-modules/ui/text-field";
import * as SocialShare from "nativescript-social-share";

import { RecipeService } from "./shared";
import { LoginService, alert } from "../shared";

@Component({
  selector: "gr-recipes",
  moduleId: module.id,
  templateUrl: "./recipes.component.html",
  styleUrls: ["./recipes-common.css", "./recipes.component.css"],
  providers: [RecipeService]
})
export class RecipesComponent implements OnInit {
  recipe: string = "";
  isShowingRecent = false;
  isLoading = false;

  @ViewChild("recipeTextField", { static: false }) recipeTextField: ElementRef;

  constructor(private router: Router,
    private store: RecipeService,
    private loginService: LoginService,
    private page: Page) {}

  ngOnInit() {
    this.page.actionBarHidden = true;
  }

  // Prevent the first textfield from receiving focus on Android
  // See http://stackoverflow.com/questions/5056734/android-force-edittext-to-remove-focus
  handleAndroidFocus(textField, container) {
    if (container.android) {
      container.android.setFocusableInTouchMode(true);
      container.android.setFocusable(true);
      textField.android.clearFocus();
    }
  }

  showActivityIndicator() {
    this.isLoading = true;
  }
  hideActivityIndicator() {
    this.isLoading = false;
  }

  add(target: string) {
    // If showing recent recipes the add button should do nothing.
    if (this.isShowingRecent) {
      return;
    }

    let textField = <TextField>this.recipeTextField.nativeElement;

    if (this.recipe.trim() === "") {
      // If the user clicked the add button, and the textfield is empty,
      // focus the text field and return.
      if (target === "button") {
        textField.focus();
      } else {
        // If the user clicked return with an empty text field show an error.
        alert("Enter a recipe item");
      }
      return;
    }

    // Dismiss the keyboard
    // TODO: Is it better UX to dismiss the keyboard, or leave it up so the
    // user can continue to add more recipes?
    textField.dismissSoftInput();

    this.showActivityIndicator();
    this.store.add(this.recipe)
      .subscribe(
        () => {
          this.recipe = "";
          this.hideActivityIndicator();
        },
        () => {
          alert("An error occurred while adding an item to your list.");
          this.hideActivityIndicator();
        }
      );
  }

  toggleRecent() {
    this.isShowingRecent = !this.isShowingRecent;
  }

  showMenu() {
    action({
      message: "What would you like to do?",
      actions: ["Share", "Log Off"],
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result === "Share") {
        this.share();
      } else if (result === "Log Off") {
        this.logoff();
      }
    });
  }

  share() {
    let items = this.store.items.value;
    let list = [];
    for (let i = 0, size = items.length; i < size ; i++) {
      list.push(items[i].name);
    }
    SocialShare.shareText(list.join(", ").trim());
  }

  logoff() {
    this.loginService.logoff();
    this.router.navigate(["/login"]);
  }
}
