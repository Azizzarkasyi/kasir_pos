type Category = {
    id: string;
    name: string;
}

type Ingredient = {
    ingredient: {
        id: string,
        name: string,
        variant_id?: string
    },
    unit?: {
        name: string,
        id: string
    },
    amount: number
}

