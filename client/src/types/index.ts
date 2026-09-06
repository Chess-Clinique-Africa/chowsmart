export type Role = 'USER' | 'ADMIN';
export type Difficulty = 'EASY' | 'MEDIUM' | 'ADVANCED';
export type FavoriteType = 'RESTAURANT' | 'RECIPE' | 'BREAD' | 'MENU_ITEM';
export type MenuItemType =
  | 'STARTER'
  | 'MAIN'
  | 'SIDE'
  | 'DESSERT'
  | 'DRINK'
  | 'BREAD'
  | 'RECIPE'
  | 'MENU_ITEM';

export interface ApiErrorBody {
  message: string;
  code: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface Cuisine {
  id: string;
  name: string;
  slug: string;
}

export interface RestaurantCuisine {
  restaurantId: string;
  cuisineId: string;
  cuisine: Cuisine;
}

export interface OpeningHours {
  [day: string]: string | undefined;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: OpeningHours | null;
  priceRange: string;
  rating: number;
  image: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  cuisines?: RestaurantCuisine[];
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  ingredients: string[];
  allergens: string[];
  calories: number | null;
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'slug'>;
}

export interface BreadIngredient {
  id: string;
  breadId: string;
  ingredient: string;
  quantity: number;
  unit: string;
  sortOrder: number;
}

export interface BreadNutrition {
  breadId: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fibre: number;
  sodium: number;
  perNote: string;
}

export interface Pairing {
  id: string;
  breadId: string;
  foodName: string;
  description: string;
  image: string | null;
  category: string;
}

export interface Bread {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
  category: string;
  number: number;
  allergens: string[];
  featured: boolean;
  portionNote: string | null;
  prepMinutes: number | null;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
  ingredients?: BreadIngredient[];
  nutrition?: BreadNutrition | null;
  pairings?: Pairing[];
  _count?: { ingredients: number; pairings: number };
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredient: string;
  quantity: string;
  unit: string;
  sortOrder: number;
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  instructions: string[];
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  allergens: string[];
  dietaryTags: string[];
  cuisineId: string | null;
  breadSlug: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  cuisine?: Cuisine | null;
  ingredients?: RecipeIngredient[];
  _count?: { ingredients: number };
}

export interface Favorite {
  id: string;
  userId: string;
  itemType: FavoriteType;
  itemId: string;
  createdAt: string;
  item?: Restaurant | Recipe | Bread | MenuItem | null;
}

export interface MenuPlanItem {
  id?: string;
  menuPlanId?: string;
  itemType: MenuItemType;
  itemId: string;
  name: string;
  quantity: number;
  notes?: string | null;
  sortOrder?: number;
  calories?: number | null;
  price?: number | null;
}

export interface MenuPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items: MenuPlanItem[];
}

export interface SearchResults {
  restaurants: Restaurant[];
  recipes: Recipe[];
  breads: Bread[];
  menuItems: MenuItem[];
  cuisines: Cuisine[];
}

export interface AdminStats {
  users: number;
  restaurants: number;
  recipes: number;
  breads: number;
  menuItems: number;
  menuPlans: number;
  favorites: number;
  cuisines: number;
}

export interface RestaurantListParams {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  city?: string;
  price?: string;
  rating?: number;
  featured?: boolean;
}

export interface RecipeListParams {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  difficulty?: Difficulty;
  dietaryTag?: string;
  featured?: boolean;
  breadSlug?: string;
}

export interface BreadListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
}

export interface MenuItemListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  restaurantId?: string;
}

export interface CanvasMenuItem {
  clientId: string;
  itemType: MenuItemType;
  itemId: string;
  name: string;
  quantity: number;
  notes?: string;
  calories?: number | null;
  price?: number | null;
  categoryLabel?: string;
}

export type FilterOption = {
  label: string;
  value: string;
};
