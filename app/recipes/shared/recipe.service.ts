import { Injectable, NgZone } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { BehaviorSubject, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

import { BackendService } from "../../shared";
import { Recipe } from "./recipe.model";

@Injectable()
export class RecipeService {
  items: BehaviorSubject<Array<Recipe>> = new BehaviorSubject([]);
  private allItems: Array<Recipe> = [];
  baseUrl = BackendService.baseUrl + "appdata/" + BackendService.appKey + "/Recipes";

  constructor(private http: HttpClient, private zone: NgZone) { }

  load() {
    return this.http.get(this.baseUrl, {
      headers: this.getCommonHeaders()
    })
    .pipe(
      map((data: any[]) => {
        this.allItems = data
          .sort((a, b) => {
            return a._kmd.lmt > b._kmd.lmt ? -1 : 1;
          })
          .map(
            recipe => new Recipe(
              recipe._id,
              recipe.Name,
              recipe.Done || false,
              recipe.Deleted || false
          )
        );
        this.publishUpdates();
      }),
      catchError(this.handleErrors)
    );
  }

  add(name: string) {
    return this.http.post(
      this.baseUrl,
      JSON.stringify({ Name: name }),
      { headers: this.getCommonHeaders() }
    )
    .pipe(
      map((data: any) => {
        this.allItems.unshift(new Recipe(data._id, name, false, false));
        this.publishUpdates();
      }),
      catchError(this.handleErrors)
    );
  }

  setDeleteFlag(item: Recipe) {
    item.deleted = true;
    return this.put(item)
      .pipe(
        map(data => {
          item.done = false;
          this.publishUpdates();
        })
      );
  }

  unsetDeleteFlag(item: Recipe) {
    item.deleted = false;
    return this.put(item)
      .pipe(
        map(data => {
          item.done = false;
          this.publishUpdates();
        })
      );
  }


  toggleDoneFlag(item: Recipe) {
    item.done = !item.done;
    this.publishUpdates();
    return this.put(item);
  }

  permanentlyDelete(item: Recipe) {
    return this.http
      .delete(
        this.baseUrl + "/" + item.id,
        { headers: this.getCommonHeaders() }
      )
      .pipe(
        map(data => {
          let index = this.allItems.indexOf(item);
          this.allItems.splice(index, 1);
          this.publishUpdates();
        }),
        catchError(this.handleErrors)
      );
  }

  private put(recipe: Recipe) {
    return this.http.put(
      this.baseUrl + "/" + recipe.id,
      JSON.stringify({
        Name: recipe.name,
        Done: recipe.done,
        Deleted: recipe.deleted
      }),
      { headers: this.getCommonHeaders() }
    )
    .pipe(catchError(this.handleErrors));
  }

  private publishUpdates() {
    // Make sure all updates are published inside NgZone so that change detection is triggered if needed
    this.zone.run(() => {
      // must emit a *new* value (immutability!)
      this.items.next([...this.allItems]);
    });
  }

  private getCommonHeaders() {
    return new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Kinvey " + BackendService.token,
    });
  }

  private handleErrors(error: HttpErrorResponse) {
    console.log(error);
    return throwError(error);
  }
}
