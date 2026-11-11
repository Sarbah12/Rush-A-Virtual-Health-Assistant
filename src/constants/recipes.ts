// Healthy Recipes: familiar Ghanaian dishes, cooked lighter. Bundled so they
// work offline.

export type Recipe = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  serves: number;
  tags: ('Low salt' | 'Diabetes friendly' | 'High fibre' | 'Pregnancy' | 'Quick' | 'Vegetarian')[];
  icon: string;
  ingredients: string[];
  steps: string[];
  tip: string;
};

export const RECIPES: Recipe[] = [
  {
    id: 'kontomire-stew',
    title: 'Light kontomire stew',
    summary: 'Cocoyam leaves with egg and a little palm oil. Rich in iron and folate.',
    minutes: 35,
    serves: 4,
    tags: ['Pregnancy', 'Low salt', 'High fibre'],
    icon: 'leaf-outline',
    ingredients: [
      '2 large bunches kontomire (cocoyam leaves), washed and chopped',
      '2 tablespoons palm oil',
      '1 onion, chopped',
      '3 tomatoes, blended',
      '1 thumb ginger and 2 cloves garlic, grated',
      '2 tablespoons ground agushie (melon seeds)',
      '4 boiled eggs or 1 small tin mackerel',
      'Fresh pepper to taste, and a small pinch of salt',
    ],
    steps: [
      'Steam the chopped kontomire for 10 minutes, then drain.',
      'Heat the palm oil and fry the onion, ginger and garlic for 3 minutes.',
      'Add the tomatoes and pepper and simmer for 10 minutes.',
      'Mix the agushie with a little water to a paste, stir it in and cook for 5 minutes.',
      'Add the kontomire and eggs or fish, warm through and serve with boiled yam or plantain.',
    ],
    tip: 'Skip the stock cube; the ginger, garlic and agushie give plenty of flavour.',
  },
  {
    id: 'red-red',
    title: 'Red-red with less oil',
    summary: 'Black-eyed bean stew with boiled or baked plantain instead of fried.',
    minutes: 50,
    serves: 4,
    tags: ['High fibre', 'Vegetarian', 'Diabetes friendly'],
    icon: 'nutrition-outline',
    ingredients: [
      '2 cups black-eyed beans, soaked overnight',
      '2 tablespoons palm oil',
      '1 onion, chopped',
      '2 tomatoes, chopped',
      '1 teaspoon ground ginger or a thumb of fresh ginger',
      '2 ripe-ish plantains',
      'Pepper and a small pinch of salt',
    ],
    steps: [
      'Boil the beans until soft, about 35 minutes. Drain, keeping a cup of the water.',
      'Fry the onion in the palm oil for 3 minutes, add the tomatoes, ginger and pepper, and cook for 8 minutes.',
      'Stir in the beans and a little cooking water. Simmer for 10 minutes.',
      'Meanwhile, boil the plantain in its skin for 15 minutes, or bake slices in a hot oven until golden.',
    ],
    tip: 'Firmer, less ripe plantain raises blood sugar more slowly.',
  },
  {
    id: 'grilled-tilapia',
    title: 'Grilled tilapia with pepper sauce',
    summary: 'A lean, protein-rich dinner with a fresh tomato and onion relish.',
    minutes: 40,
    serves: 2,
    tags: ['Low salt', 'Diabetes friendly'],
    icon: 'fish-outline',
    ingredients: [
      '2 medium tilapia, cleaned and scored',
      '1 thumb ginger, 3 cloves garlic, 1 small onion, blended',
      'Juice of 1 lime',
      '2 tomatoes, 1 onion and 1 green pepper, finely chopped',
      'Fresh chilli to taste',
    ],
    steps: [
      'Rub the fish inside and out with the ginger mix and lime juice. Rest for 15 minutes.',
      'Grill over charcoal or in a hot oven for 10 to 12 minutes on each side.',
      'Mix the chopped tomato, onion, green pepper and chilli with a squeeze of lime for the relish.',
      'Serve with a small portion of banku or kenkey and plenty of the relish.',
    ],
    tip: 'Fill half your plate with the vegetable relish and keep the banku portion to the size of your fist.',
  },
  {
    id: 'hausa-koko',
    title: 'Hausa koko with groundnuts',
    summary: 'A warming millet porridge breakfast, lightly sweetened.',
    minutes: 15,
    serves: 2,
    tags: ['Quick', 'Vegetarian', 'High fibre'],
    icon: 'cafe-outline',
    ingredients: [
      '1 cup millet koko paste',
      '3 cups water',
      'Ginger, cloves and grains of selim (hwentia) to taste',
      '1 teaspoon sugar or honey per bowl',
      'A handful of roasted groundnuts',
      'Milk (optional)',
    ],
    steps: [
      'Boil 2 cups of water with the spices.',
      'Mix the koko paste with 1 cup of cold water until smooth.',
      'Pour into the boiling water, stirring constantly, until thick, about 5 minutes.',
      'Serve with groundnuts on the side and a little milk.',
    ],
    tip: 'The groundnuts add protein that keeps you full for longer than koge or sugar bread.',
  },
  {
    id: 'garden-egg-salad',
    title: 'Garden egg and avocado salad',
    summary: 'A no-cook lunch: crunchy garden eggs, avocado, beans and lime.',
    minutes: 10,
    serves: 2,
    tags: ['Quick', 'Vegetarian', 'Diabetes friendly', 'High fibre'],
    icon: 'restaurant-outline',
    ingredients: [
      '4 garden eggs, sliced',
      '1 avocado, cubed',
      '1 cup cooked beans',
      '1 tomato and ½ onion, chopped',
      'Juice of 1 lime, a little oil, pepper',
    ],
    steps: [
      'Put everything in a bowl.',
      'Dress with lime juice, a little oil and pepper, and toss gently.',
      'Eat straight away, or with a slice of wholemeal bread.',
    ],
    tip: 'Garden eggs are low in calories and high in fibre, which is great for steady blood sugar.',
  },
  {
    id: 'light-light-soup',
    title: 'Chicken light soup',
    summary: 'A clear, spicy soup that comforts when you are unwell.',
    minutes: 45,
    serves: 4,
    tags: ['Low salt', 'Pregnancy'],
    icon: 'flame-outline',
    ingredients: [
      '1 kg chicken pieces, skin removed',
      '1 onion, 3 tomatoes, 2 garden eggs',
      '1 thumb ginger, 3 cloves garlic',
      'Fresh pepper to taste',
      '6 cups water and a small pinch of salt',
    ],
    steps: [
      'Season the chicken with blended ginger, garlic and onion. Steam in its own juices for 10 minutes.',
      'Add the water, whole tomatoes, garden eggs and pepper. Boil for 15 minutes.',
      'Remove the tomatoes, garden eggs and pepper, blend them and return to the pot through a sieve.',
      'Simmer for 15 minutes more. Serve on its own, or with a small ball of fufu or rice.',
    ],
    tip: 'Removing the chicken skin cuts most of the fat without losing flavour.',
  },
];
