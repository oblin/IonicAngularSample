import { Injectable } from '@angular/core';
import { Recipe } from './recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private recipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Schnitzel',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Egg_schnitzel.jpg',
      ingredients: ['French Fired', 'Pork Meat', 'Salad']
    },
    {
      id: 'r2',
      title: 'Spaghetti',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Spaghetti_au_jambon_de_Parme.JPG',
      ingredients: ['Spaghetti', 'Meat', 'Tomatoes']
    }
  ];
  
  constructor() { }

  getAllRecipes() {
    // javascript 是 reference type，因此這裡意思是將原來的 recipes array 複製一份 copy 傳出去
    // 讓外部不要影響內部的資料
    return [...this.recipes];
  }

  getRecipe(recipeId) {
    // 一樣回傳 copied object，非 object itself
    return {...this.recipes.find(recipe => recipe.id === recipeId)};
  }

  deleteRecipe(recipeId: string) {
    this.recipes = this.recipes.filter(recipe => recipe.id !== recipeId);
  }
}
