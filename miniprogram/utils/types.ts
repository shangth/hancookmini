// 用户角色
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// 聚会状态
export enum GatheringStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

// 菜品类型
export enum DishType {
  MULTI_SERVING = 'multi_serving',
  SINGLE_SERVING = 'single_serving'
}

// 备菜阶段
export enum PreparationStage {
  CONFIRM_DISHES = 1,
  SHOPPING_LIST = 2
}

// 用户类型
export interface User {
  id: string
  openid: string
  nickname: string
  avatar: string
  role: UserRole
  created_at: string
}

// 聚会类型
export interface Gathering {
  id: string
  name: string
  time: string
  location: string
  status: GatheringStatus
  menu_locked: boolean
  preparation_stage_id: PreparationStage
  created_by: string
  created_at: string
  updated_at: string
}

// 原材料
export interface Ingredient {
  name: string
  quantity?: string
}

// 菜品类型
export interface Dish {
  id: string
  name: string
  image_url: string
  category: string
  type: DishType
  ingredients: Ingredient[]
  cooking_method: string
  notes: string
  created_by: string
  created_at: string
}

// 点赞类型
export interface Like {
  id: string
  gathering_id: string
  dish_id: string
  user_id: string
  created_at: string
}

// 确定菜品类型
export interface ConfirmedDish {
  id: string
  gathering_id: string
  dish_id: string
  confirmed_at: string
}

// 采购清单类型
export interface ShoppingItem {
  id: string
  gathering_id: string
  ingredient_name: string
  quantity: string
  used_in_dishes: string[]
  is_purchased: boolean
  created_at: string
  updated_at: string
}

// 菜品与点赞信息
export interface DishWithLikes {
  dish: Dish
  likes: Like[]
  likeCount: number
  isLiked: boolean
  likedUsers: User[]
}


