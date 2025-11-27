import { create } from "zustand";

interface RecipeFormState {
  name: string;
  category: string;
  imageUri: string | null;
  ingredients: Ingredient[];

  setName: (value: string) => void;
  setCategory: (value: string) => void;
  setImageUri: (value: string | null) => void;
  setIngredients: (updater: (prev: Ingredient[]) => Ingredient[]) => void;
  addIngredient: (ingredient: Ingredient) => void;
  reset: () => void;
}

const initialState: Omit<
  RecipeFormState,
  | "setName"
  | "setCategory"
  | "setImageUri"
  | "setIngredients"
  | "addIngredient"
  | "reset"
> = {
  name: "",
  category: "",
  imageUri: null,
  ingredients: [],
};

export const useRecipeFormStore = create<RecipeFormState>(set => ({
  ...initialState,
  setName: value => set({ name: value }),
  setCategory: value => set({ category: value }),
  setImageUri: value => set({ imageUri: value }),
  setIngredients: updater => set(state => ({ ingredients: updater(state.ingredients) })),
  addIngredient: ingredient =>
    set(state => ({ ingredients: [...state.ingredients, ingredient] })),
  reset: () => set(initialState),
}));
