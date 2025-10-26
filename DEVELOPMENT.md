# 开发文档

## 快速开始

### 1. 环境准备
- 安装微信开发者工具
- Node.js 环境（可选，用于未来的依赖管理）

### 2. 打开项目
1. 启动微信开发者工具
2. 选择"导入项目"
3. 选择 `miniApp` 目录
4. 填写 AppID（测试号即可）
5. 点击"导入"

### 3. 项目初始化
项目首次启动时会自动初始化 Mock 数据，包括：
- 用户数据（4个用户）
- 聚会数据（3个聚会）
- 菜品数据（8道菜品）
- 点赞数据（10条点赞记录）

## 开发指南

### 页面开发规范

每个页面包含4个文件：
- `.json` - 页面配置
- `.wxml` - 页面结构
- `.less` - 页面样式
- `.ts` - 页面逻辑

### 组件开发规范

组件与页面类似，但配置文件需要声明为组件：
```json
{
  "component": true
}
```

### 数据管理

#### 读取数据
```typescript
import { getGatherings, getDishes, getLikes } from '../../utils/storage'

const gatherings = getGatherings()
const dishes = getDishes()
const likes = getLikes()
```

#### 保存数据
```typescript
import { saveGatherings, saveDishes, saveLikes } from '../../utils/storage'

saveGatherings(newGatherings)
saveDishes(newDishes)
saveLikes(newLikes)
```

#### 获取当前用户
```typescript
import { getCurrentUser } from '../../utils/storage'

const currentUser = getCurrentUser()
```

### 类型定义

所有类型定义在 `utils/types.ts` 中：
```typescript
import { User, Gathering, Dish, Like, DishWithLikes } from '../../utils/types'
```

### 日期处理

```typescript
import { formatDate, formatDateShort, getGatheringStatusText } from '../../utils/date'

// 格式化为：2025-10-14 18:00
const dateStr = formatDate(isoString)

// 格式化为：10-14 18:00
const shortStr = formatDateShort(isoString)

// 获取状态文本
const statusText = getGatheringStatusText('not_started') // "未开始"
```

### 事件总线（WebSocket 模拟）

```typescript
import { eventBus, Events } from '../../utils/event-bus'

// 监听事件
eventBus.on(Events.LIKE_UPDATED, (data) => {
  console.log('点赞更新', data)
})

// 触发事件
eventBus.emit(Events.LIKE_UPDATED, {
  dishId: 'dish_001',
  likes: [...],
  count: 5
})

// 取消监听
eventBus.off(Events.LIKE_UPDATED, handler)
```

## 功能实现说明

### 1. 聚会管理

#### 创建聚会
```typescript
const newGathering: Gathering = {
  id: `gathering_${Date.now()}`,
  name: '周末聚餐',
  time: '2025-10-20T18:00:00Z',
  location: '我家',
  status: GatheringStatus.NOT_STARTED,
  menu_locked: false,
  preparation_stage_id: PreparationStage.CONFIRM_DISHES,
  created_by: currentUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

#### 编辑聚会
```typescript
const gathering = gatherings.find(g => g.id === id)
gathering.name = '新名称'
gathering.updated_at = new Date().toISOString()
saveGatherings(gatherings)
```

#### 删除聚会
```typescript
const newGatherings = gatherings.filter(g => g.id !== id)
saveGatherings(newGatherings)
```

### 2. 点菜功能

#### 点赞菜品
```typescript
const newLike: Like = {
  id: `like_${Date.now()}`,
  gathering_id: gatheringId,
  dish_id: dishId,
  user_id: currentUser.id,
  created_at: new Date().toISOString()
}

const allLikes = getLikes()
allLikes.push(newLike)
saveLikes(allLikes)
```

#### 取消点赞
```typescript
const allLikes = getLikes()
const newLikes = allLikes.filter(l => l.id !== likeId)
saveLikes(newLikes)
```

### 3. 备菜功能

#### 生成采购清单
```typescript
const ingredientMap: Record<string, ShoppingItem> = {}

confirmedDishes.forEach(dishItem => {
  dishItem.dish.ingredients.forEach(ingredient => {
    const key = ingredient.name
    
    if (!ingredientMap[key]) {
      ingredientMap[key] = {
        id: `shopping_${Date.now()}_${key}`,
        gathering_id: gatheringId,
        ingredient_name: ingredient.name,
        quantity: ingredient.quantity || '适量',
        used_in_dishes: [dish.id],
        is_purchased: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else {
      ingredientMap[key].used_in_dishes.push(dish.id)
    }
  })
})

const shoppingList = Object.values(ingredientMap)
```

## 常见问题

### Q1: 数据丢失了怎么办？
A: 在控制台执行以下代码重新初始化：
```javascript
require('./utils/storage').initStorage()
```

### Q2: 如何切换用户角色？
A: 修改 `utils/mock-data.ts` 中的 `currentUser`：
```typescript
export const currentUser = mockUsers[0] // 管理员
// export const currentUser = mockUsers[1] // 普通用户
```

### Q3: 如何添加新的菜品分类？
A: 在添加菜单页面点击"新增分类"即可。

### Q4: 如何清空所有数据？
A: 在控制台执行：
```javascript
require('./utils/storage').clearAllStorage()
```

## 调试技巧

### 1. 使用 console.log
```typescript
console.log('当前用户', getCurrentUser())
console.log('所有聚会', getGatherings())
```

### 2. 使用微信开发者工具的调试器
- AppData 面板：查看页面数据
- Storage 面板：查看本地存储
- Console 面板：查看日志输出

### 3. 网络请求模拟
当前使用本地存储，未来接入后端时，可在 `utils/api.ts` 中统一管理接口请求。

## 性能优化建议

1. **列表渲染优化**：使用 `wx:key` 指定唯一标识
2. **图片优化**：使用 `mode="aspectFill"` 和适当的尺寸
3. **防抖处理**：搜索功能建议添加防抖
4. **分页加载**：数据量大时考虑分页

## 代码规范

1. **命名规范**
   - 文件名：小写，使用连字符（kebab-case）
   - 变量名：驼峰命名（camelCase）
   - 类型名：帕斯卡命名（PascalCase）

2. **代码格式**
   - 使用 2 空格缩进
   - 字符串使用单引号
   - 语句结尾加分号

3. **注释规范**
   - 复杂逻辑必须添加注释
   - 函数需要说明参数和返回值
   - 重要的业务逻辑需要注释

## 后续开发计划

### Phase 1: 后端集成
- [ ] 创建 API 接口管理模块
- [ ] 接入真实后端接口
- [ ] 实现 WebSocket 实时通信

### Phase 2: 功能增强
- [ ] 用户搜索历史
- [ ] 菜品详情页
- [ ] 图片上传到服务器
- [ ] 微信登录授权

### Phase 3: 性能优化
- [ ] 图片懒加载
- [ ] 列表虚拟滚动
- [ ] 数据缓存策略
- [ ] 请求防抖和节流

### Phase 4: 用户体验
- [ ] 加载动画
- [ ] 骨架屏
- [ ] 错误处理优化
- [ ] 离线模式支持

## 联系方式

如有问题，请联系开发团队。


