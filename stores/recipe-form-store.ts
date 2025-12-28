import {create} from "zustand";

// Type definition for ingredient in recipe
interface Ingredient {
  ingredient: {
    id: string;
    name: string;
    variant_id?: string;
    variant_name?: string;
  };
  amount: number;
  unit?: {
    id: string;
    name: string;
  };
}

interface RecipeFormState {
  name: string;
  category: string;
  imageUri: string | null;
  ingredients: Ingredient[];
  editingIngredientIndex: number | null;

  setName: (value: string) => void;
  setCategory: (value: string) => void;
  setImageUri: (value: string | null) => void;
  setIngredients: (
    ingredients: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])
  ) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (index: number, ingredient: Ingredient) => void;
  removeIngredient: (index: number) => void;
  setEditingIngredientIndex: (index: number | null) => void;
  reset: () => void;
}

const initialState: Omit<
  RecipeFormState,
  | "setName"
  | "setCategory"
  | "setImageUri"
  | "setIngredients"
  | "addIngredient"
  | "updateIngredient"
  | "removeIngredient"
  | "setEditingIngredientIndex"
  | "reset"
> = {
  name: "",
  category: "",
  imageUri: null,
  ingredients: [],
  editingIngredientIndex: null,
};

export const useRecipeFormStore = create<RecipeFormState>(set => ({
  ...initialState,
  setName: value => set({name: value}),
  setCategory: value => set({category: value}),
  setImageUri: value => set({imageUri: value}),
  setIngredients: ingredients =>
    set(state => ({
      ingredients:
        typeof ingredients === "function"
          ? ingredients(state.ingredients)
          : ingredients,
    })),
  addIngredient: ingredient =>
    set(state => ({ingredients: [...state.ingredients, ingredient]})),
  updateIngredient: (index, ingredient) =>
    set(state => ({
      ingredients: state.ingredients.map((ing, i) =>
        i === index ? ingredient : ing
      ),
    })),
  removeIngredient: index =>
    set(state => ({
      ingredients: state.ingredients.filter((_, i) => i !== index),
    })),
  setEditingIngredientIndex: index => set({editingIngredientIndex: index}),
  reset: () => set(initialState),
}));

