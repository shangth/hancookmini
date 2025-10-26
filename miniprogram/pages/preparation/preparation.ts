// pages/preparation/preparation.ts
import { 
  getGatheringById, 
  saveGatherings,
  getDishes, 
  getLikes, 
  getCurrentUser,
  mockUsers 
} from '../../utils/storage'
import { 
  Gathering, 
  DishWithLikes, 
  ShoppingItem, 
  PreparationStage 
} from '../../utils/types'

Page({
  data: {
    gatheringId: '',
    gathering: {} as Gathering,
    currentStage: 1,
    
    // 阶段一：确定菜品
    likedDishes: [] as DishWithLikes[],
    confirmedDishIds: [] as string[],
    
    // 阶段二：生成清单
    confirmedDishes: [] as DishWithLikes[],
    showConfirmedDishes: true,
    shoppingList: [] as ShoppingItem[],
    purchasedCount: 0,
    purchaseProgress: 0
  },

  onLoad(options: any) {
    const { id } = options
    if (!id) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      gatheringId: id
    })

    this.loadData()
  },

  loadData() {
    const { gatheringId } = this.data
    const gathering = getGatheringById(gatheringId)

    if (!gathering) {
      wx.showToast({
        title: '聚会不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      gathering,
      currentStage: gathering.preparation_stage_id || PreparationStage.CONFIRM_DISHES
    })

    // 加载点赞的菜品
    this.loadLikedDishes()

    // 如果是阶段二，加载已确定的菜品和清单
    if (this.data.currentStage === PreparationStage.SHOPPING_LIST) {
      this.loadShoppingList()
    }
  },

  loadLikedDishes() {
    const { gatheringId } = this.data
    const allDishes = getDishes()
    const likes = getLikes().filter(l => l.gathering_id === gatheringId)

    // 获取所有被点赞的菜品
    const likedDishIds = Array.from(new Set(likes.map(l => l.dish_id)))
    const likedDishes: DishWithLikes[] = likedDishIds.map(dishId => {
      const dish = allDishes.find(d => d.id === dishId)!
      const dishLikes = likes.filter(l => l.dish_id === dishId)
      const likedUsers = dishLikes.map(like => mockUsers.find(u => u.id === like.user_id)!).filter(u => u)

      return {
        dish,
        likes: dishLikes,
        likeCount: dishLikes.length,
        isLiked: dishLikes.some(l => l.user_id === getCurrentUser().id),
        likedUsers
      }
    }).sort((a, b) => b.likeCount - a.likeCount)

    this.setData({
      likedDishes
    })
  },

  onDishCheckChange(e: any) {
    const { dishId } = e.currentTarget.dataset
    const { confirmedDishIds } = this.data
    
    if (confirmedDishIds.includes(dishId)) {
      // 取消选中
      this.setData({
        confirmedDishIds: confirmedDishIds.filter(id => id !== dishId)
      })
    } else {
      // 选中
      this.setData({
        confirmedDishIds: [...confirmedDishIds, dishId]
      })
    }
  },

  generateShoppingList() {
    const { confirmedDishIds, likedDishes, gatheringId } = this.data

    if (confirmedDishIds.length === 0) {
      wx.showToast({
        title: '请至少选择一道菜品',
        icon: 'none'
      })
      return
    }

    // 获取确定的菜品
    const confirmedDishes = likedDishes.filter(item => confirmedDishIds.includes(item.dish.id))

    // 生成采购清单
    const ingredientMap: Record<string, ShoppingItem> = {}

    confirmedDishes.forEach(dishItem => {
      const { dish } = dishItem
      
      dish.ingredients.forEach(ingredient => {
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
          // 如果原材料已存在，添加到使用列表
          if (!ingredientMap[key].used_in_dishes.includes(dish.id)) {
            ingredientMap[key].used_in_dishes.push(dish.id)
          }
        }
      })
    })

    const shoppingList = Object.values(ingredientMap)

    // 更新聚会阶段
    const gatherings = require('../../utils/storage').getGatherings()
    const gathering = gatherings.find((g: Gathering) => g.id === gatheringId)
    if (gathering) {
      gathering.preparation_stage_id = PreparationStage.SHOPPING_LIST
      gathering.updated_at = new Date().toISOString()
      require('../../utils/storage').saveGatherings(gatherings)
    }

    this.setData({
      currentStage: PreparationStage.SHOPPING_LIST,
      confirmedDishes,
      shoppingList
    })

    this.calculatePurchaseProgress()

    wx.showToast({
      title: '清单生成成功',
      icon: 'success'
    })
  },

  loadShoppingList() {
    const { confirmedDishIds, likedDishes } = this.data
    
    // 这里应该从存储中读取，为简化演示，重新生成
    if (confirmedDishIds.length > 0) {
      this.generateShoppingList()
    }
  },

  switchStage(e: any) {
    const stage = parseInt(e.currentTarget.dataset.stage)
    
    if (stage === PreparationStage.SHOPPING_LIST && this.data.confirmedDishIds.length === 0) {
      wx.showToast({
        title: '请先确定菜品',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      currentStage: stage
    })
  },

  toggleConfirmedDishes() {
    this.setData({
      showConfirmedDishes: !this.data.showConfirmedDishes
    })
  },

  backToConfirmStage() {
    this.setData({
      currentStage: PreparationStage.CONFIRM_DISHES
    })
  },

  onPurchaseCheckChange(e: any) {
    const { itemId } = e.currentTarget.dataset
    const { shoppingList } = this.data
    
    const item = shoppingList.find(i => i.id === itemId)
    if (item) {
      item.is_purchased = !item.is_purchased
      item.updated_at = new Date().toISOString()
      
      this.setData({
        shoppingList
      })
      
      this.calculatePurchaseProgress()
    }
  },

  resetPurchaseStatus() {
    wx.showModal({
      title: '确认重置',
      content: '确认重置所有采购状态吗？',
      success: (res) => {
        if (res.confirm) {
          const { shoppingList } = this.data
          shoppingList.forEach(item => {
            item.is_purchased = false
            item.updated_at = new Date().toISOString()
          })
          
          this.setData({
            shoppingList
          })
          
          this.calculatePurchaseProgress()
          
          wx.showToast({
            title: '已重置',
            icon: 'success'
          })
        }
      }
    })
  },

  calculatePurchaseProgress() {
    const { shoppingList } = this.data
    const purchasedCount = shoppingList.filter(item => item.is_purchased).length
    const total = shoppingList.length
    const progress = total > 0 ? Math.round((purchasedCount / total) * 100) : 0
    
    this.setData({
      purchasedCount,
      purchaseProgress: progress
    })
  },

  getUsedInDishes(dishIds: string[]): string {
    const allDishes = getDishes()
    const dishNames = dishIds.map(id => {
      const dish = allDishes.find(d => d.id === id)
      return dish ? dish.name : ''
    }).filter(name => name)
    
    return dishNames.join('、')
  }
})


