import { User, Gathering, Dish, Like, UserRole, GatheringStatus, DishType, PreparationStage } from './types'

// Mock 用户数据
export const mockUsers: User[] = [
  {
    id: 'user_001',
    openid: 'openid_001',
    nickname: '寒厨',
    avatar: 'https://via.placeholder.com/100',
    role: UserRole.ADMIN,
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'user_002',
    openid: 'openid_002',
    nickname: '小明',
    avatar: 'https://via.placeholder.com/100',
    role: UserRole.USER,
    created_at: '2025-10-02T10:00:00Z'
  },
  {
    id: 'user_003',
    openid: 'openid_003',
    nickname: '小红',
    avatar: 'https://via.placeholder.com/100',
    role: UserRole.USER,
    created_at: '2025-10-03T10:00:00Z'
  },
  {
    id: 'user_004',
    openid: 'openid_004',
    nickname: '小李',
    avatar: 'https://via.placeholder.com/100',
    role: UserRole.USER,
    created_at: '2025-10-04T10:00:00Z'
  }
]

// Mock 聚会数据
export const mockGatherings: Gathering[] = [
  {
    id: 'gathering_001',
    name: '周末聚餐',
    time: '2025-10-20T18:00:00Z',
    location: '寒厨的家',
    status: GatheringStatus.NOT_STARTED,
    menu_locked: false,
    preparation_stage_id: PreparationStage.CONFIRM_DISHES,
    created_by: 'user_001',
    created_at: '2025-10-14T10:00:00Z',
    updated_at: '2025-10-14T10:00:00Z'
  },
  {
    id: 'gathering_002',
    name: '生日派对',
    time: '2025-10-15T19:00:00Z',
    location: '市中心餐厅',
    status: GatheringStatus.IN_PROGRESS,
    menu_locked: true,
    preparation_stage_id: PreparationStage.SHOPPING_LIST,
    created_by: 'user_001',
    created_at: '2025-10-10T10:00:00Z',
    updated_at: '2025-10-14T10:00:00Z'
  },
  {
    id: 'gathering_003',
    name: '国庆聚会',
    time: '2025-10-01T12:00:00Z',
    location: '公园野餐',
    status: GatheringStatus.FINISHED,
    menu_locked: true,
    preparation_stage_id: PreparationStage.SHOPPING_LIST,
    created_by: 'user_001',
    created_at: '2025-09-25T10:00:00Z',
    updated_at: '2025-10-02T10:00:00Z'
  }
]

// Mock 菜品数据
export const mockDishes: Dish[] = [
  {
    id: 'dish_001',
    name: '宫保鸡丁',
    image_url: 'https://via.placeholder.com/300',
    category: '川菜',
    type: DishType.MULTI_SERVING,
    ingredients: [
      { name: '鸡胸肉', quantity: '300g' },
      { name: '花生米', quantity: '100g' },
      { name: '干辣椒', quantity: '适量' },
      { name: '葱', quantity: '1根' },
      { name: '姜', quantity: '适量' },
      { name: '蒜', quantity: '3瓣' }
    ],
    cooking_method: '1. 鸡肉切丁，腌制\n2. 热油爆香葱姜蒜和干辣椒\n3. 加入鸡丁翻炒\n4. 加入调料和花生米\n5. 快速翻炒出锅',
    notes: '辣度可根据个人喜好调整',
    created_by: 'user_001',
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'dish_002',
    name: '水煮鱼',
    image_url: 'https://via.placeholder.com/300',
    category: '川菜',
    type: DishType.MULTI_SERVING,
    ingredients: [
      { name: '草鱼', quantity: '1条' },
      { name: '豆芽', quantity: '200g' },
      { name: '干辣椒', quantity: '适量' },
      { name: '花椒', quantity: '适量' },
      { name: '姜', quantity: '适量' },
      { name: '蒜', quantity: '5瓣' }
    ],
    cooking_method: '1. 鱼片成片，腌制\n2. 煮豆芽垫底\n3. 鱼片滑熟\n4. 浇热油激发香味',
    notes: '鱼片要薄，口感才嫩',
    created_by: 'user_001',
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'dish_003',
    name: '红烧肉',
    image_url: 'https://via.placeholder.com/300',
    category: '家常菜',
    type: DishType.MULTI_SERVING,
    ingredients: [
      { name: '五花肉', quantity: '500g' },
      { name: '冰糖', quantity: '适量' },
      { name: '生抽', quantity: '适量' },
      { name: '老抽', quantity: '适量' },
      { name: '料酒', quantity: '适量' },
      { name: '八角', quantity: '2个' }
    ],
    cooking_method: '1. 五花肉切块焯水\n2. 炒糖色\n3. 加入五花肉翻炒\n4. 加调料和水炖煮\n5. 收汁出锅',
    notes: '要有耐心，慢火炖煮',
    created_by: 'user_001',
    created_at: '2025-10-02T10:00:00Z'
  },
  {
    id: 'dish_004',
    name: '番茄炒蛋',
    image_url: 'https://via.placeholder.com/300',
    category: '家常菜',
    type: DishType.MULTI_SERVING,
    ingredients: [
      { name: '番茄', quantity: '2个' },
      { name: '鸡蛋', quantity: '3个' },
      { name: '葱', quantity: '1根' },
      { name: '糖', quantity: '少许' },
      { name: '盐', quantity: '适量' }
    ],
    cooking_method: '1. 鸡蛋打散炒熟盛出\n2. 番茄切块翻炒\n3. 加入鸡蛋混合\n4. 调味出锅',
    notes: '番茄要炒出汁',
    created_by: 'user_001',
    created_at: '2025-10-02T10:00:00Z'
  },
  {
    id: 'dish_005',
    name: '珍珠奶茶',
    image_url: 'https://via.placeholder.com/300',
    category: '饮品',
    type: DishType.SINGLE_SERVING,
    ingredients: [
      { name: '红茶', quantity: '1包' },
      { name: '牛奶', quantity: '200ml' },
      { name: '珍珠', quantity: '适量' },
      { name: '糖', quantity: '适量' }
    ],
    cooking_method: '1. 煮红茶\n2. 煮珍珠\n3. 混合茶、奶、糖\n4. 加入珍珠',
    notes: '每人一份',
    created_by: 'user_001',
    created_at: '2025-10-03T10:00:00Z'
  },
  {
    id: 'dish_006',
    name: '美式咖啡',
    image_url: 'https://via.placeholder.com/300',
    category: '饮品',
    type: DishType.SINGLE_SERVING,
    ingredients: [
      { name: '咖啡豆', quantity: '15g' },
      { name: '水', quantity: '200ml' }
    ],
    cooking_method: '1. 研磨咖啡豆\n2. 冲泡\n3. 加水稀释',
    notes: '每人一份',
    created_by: 'user_001',
    created_at: '2025-10-03T10:00:00Z'
  },
  {
    id: 'dish_007',
    name: '麻婆豆腐',
    image_url: 'https://via.placeholder.com/300',
    category: '川菜',
    type: DishType.MULTI_SERVING,
    ingredients: [
      { name: '豆腐', quantity: '1块' },
      { name: '猪肉末', quantity: '100g' },
      { name: '豆瓣酱', quantity: '适量' },
      { name: '花椒', quantity: '适量' },
      { name: '葱', quantity: '1根' },
      { name: '姜', quantity: '适量' }
    ],
    cooking_method: '1. 豆腐切块焯水\n2. 炒肉末\n3. 加豆瓣酱炒香\n4. 加豆腐和调料烧制\n5. 撒花椒粉出锅',
    notes: '麻辣鲜香',
    created_by: 'user_001',
    created_at: '2025-10-04T10:00:00Z'
  },
  {
    id: 'dish_008',
    name: '清蒸鲈鱼',
    image_url: 'https://via.placeholder.com/300',
    category: '粤菜',
    type: DishType.MULTI_SERVING,
    ingredients: [
      { name: '鲈鱼', quantity: '1条' },
      { name: '姜', quantity: '适量' },
      { name: '葱', quantity: '2根' },
      { name: '蒸鱼豉油', quantity: '适量' },
      { name: '料酒', quantity: '适量' }
    ],
    cooking_method: '1. 鱼处理干净\n2. 放姜葱去腥\n3. 蒸8-10分钟\n4. 浇热油和豉油',
    notes: '保持鱼肉鲜嫩',
    created_by: 'user_001',
    created_at: '2025-10-04T10:00:00Z'
  }
]

// Mock 点赞数据
export const mockLikes: Like[] = [
  { id: 'like_001', gathering_id: 'gathering_001', dish_id: 'dish_001', user_id: 'user_001', created_at: '2025-10-14T10:00:00Z' },
  { id: 'like_002', gathering_id: 'gathering_001', dish_id: 'dish_001', user_id: 'user_002', created_at: '2025-10-14T10:05:00Z' },
  { id: 'like_003', gathering_id: 'gathering_001', dish_id: 'dish_001', user_id: 'user_003', created_at: '2025-10-14T10:10:00Z' },
  { id: 'like_004', gathering_id: 'gathering_001', dish_id: 'dish_002', user_id: 'user_001', created_at: '2025-10-14T10:15:00Z' },
  { id: 'like_005', gathering_id: 'gathering_001', dish_id: 'dish_002', user_id: 'user_004', created_at: '2025-10-14T10:20:00Z' },
  { id: 'like_006', gathering_id: 'gathering_001', dish_id: 'dish_003', user_id: 'user_002', created_at: '2025-10-14T10:25:00Z' },
  { id: 'like_007', gathering_id: 'gathering_001', dish_id: 'dish_005', user_id: 'user_002', created_at: '2025-10-14T10:30:00Z' },
  { id: 'like_008', gathering_id: 'gathering_001', dish_id: 'dish_005', user_id: 'user_003', created_at: '2025-10-14T10:35:00Z' },
  { id: 'like_009', gathering_id: 'gathering_001', dish_id: 'dish_005', user_id: 'user_004', created_at: '2025-10-14T10:40:00Z' },
  { id: 'like_010', gathering_id: 'gathering_001', dish_id: 'dish_006', user_id: 'user_001', created_at: '2025-10-14T10:45:00Z' }
]

// 当前登录用户（模拟为管理员）
export const currentUser = mockUsers[0]


