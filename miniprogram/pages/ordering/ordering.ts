// pages/ordering/ordering.ts
import { getGatheringById, getDishes, getLikes, saveLikes, getCurrentUser, mockUsers } from '../../utils/storage'
import { formatDate } from '../../utils/date'
import { Gathering, Dish, Like, DishWithLikes, User, GatheringStatus } from '../../utils/types'

interface CategoryDishes {
  category: string
  dishes: DishWithLikes[]
}

Page({
  data: {
    gatheringId: '',
    gathering: {} as Gathering,
    allDishes: [] as Dish[],
    displayDishes: [] as CategoryDishes[],
    recommendedDishes: [] as DishWithLikes[],
    categories: [] as string[],
    currentCategory: '全部',
    searchKeyword: '',
    scrollIntoView: '',
    currentUser: {} as User,
    showDrawer: false,
    drawerTab: 'all' as 'all' | 'my',
    allLikedDishes: [] as DishWithLikes[],
    myLikedDishes: [] as DishWithLikes[],
    currentDrawerList: [] as DishWithLikes[],
    myLikedCount: 0
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

    const currentUser = getCurrentUser()
    this.setData({
      gatheringId: id,
      currentUser
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

    const allDishes = getDishes()
    const likes = getLikes().filter(l => l.gathering_id === gatheringId)

    // 构建菜品分类
    const categoryMap: Record<string, DishWithLikes[]> = {}
    const categories = ['全部', '推荐']

    allDishes.forEach(dish => {
      const dishLikes = likes.filter(l => l.dish_id === dish.id)
      const dishWithLikes = this.buildDishWithLikes(dish, dishLikes)

      if (!categoryMap[dish.category]) {
        categoryMap[dish.category] = []
        categories.push(dish.category)
      }
      categoryMap[dish.category].push(dishWithLikes)
    })

    const displayDishes: CategoryDishes[] = Object.entries(categoryMap).map(([category, dishes]) => ({
      category,
      dishes: dishes.sort((a, b) => b.likeCount - a.likeCount)
    }))

    // 生成推荐菜品
    const recommendedDishes = this.generateRecommendations(allDishes, likes)

    // 计算我的点赞数
    const myLikedCount = likes.filter(l => l.user_id === this.data.currentUser.id).length

    this.setData({
      gathering,
      allDishes,
      displayDishes,
      categories,
      recommendedDishes,
      myLikedCount
    })

    this.updateLikedLists()
  },

  buildDishWithLikes(dish: Dish, likes: Like[]): DishWithLikes {
    const currentUser = this.data.currentUser
    const likedUsers = likes.map(like => mockUsers.find(u => u.id === like.user_id)!).filter(u => u)

    return {
      dish,
      likes,
      likeCount: likes.length,
      isLiked: likes.some(l => l.user_id === currentUser.id),
      likedUsers
    }
  },

  generateRecommendations(allDishes: Dish[], likes: Like[]): DishWithLikes[] {
    const currentUser = this.data.currentUser
    const userLikes = likes.filter(l => l.user_id === currentUser.id)
    const userLikedDishIds = userLikes.map(l => l.dish_id)

    // 推荐逻辑：
    // 1. 热门菜品（点赞数多的）
    // 2. 用户未点赞的菜品
    // 3. 限制6个

    const dishesWithScore = allDishes.map(dish => {
      const dishLikes = likes.filter(l => l.dish_id === dish.id)
      const isLiked = userLikedDishIds.includes(dish.id)
      
      let score = dishLikes.length * 10 // 点赞数权重

      // 未点赞的加分
      if (!isLiked) {
        score += 5
      }

      return {
        dish,
        likes: dishLikes,
        score
      }
    })

    // 按分数排序，取前6个
    const topDishes = dishesWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => this.buildDishWithLikes(item.dish, item.likes))

    return topDishes
  },

  formatDate(dateStr: string): string {
    return formatDate(dateStr)
  },

  selectCategory(e: any) {
    const { category } = e.currentTarget.dataset
    
    this.setData({
      currentCategory: category,
      scrollIntoView: `category-${category}`
    })
  },

  onScroll(e: any) {
    // 滚动时更新当前分类（简化版，仅演示）
    // 实际应该根据滚动位置判断当前显示的分类
  },

  onSearch(e: any) {
    const keyword = e.detail.value.trim()
    this.setData({
      searchKeyword: keyword
    })

    if (!keyword) {
      this.loadData()
      return
    }

    // 搜索菜品
    const { allDishes, gatheringId } = this.data
    const likes = getLikes().filter(l => l.gathering_id === gatheringId)

    const filteredDishes = allDishes.filter(dish => {
      // 搜索名称
      if (dish.name.includes(keyword)) return true
      
      // 搜索原材料
      if (dish.ingredients.some(ing => ing.name.includes(keyword))) return true
      
      return false
    })

    // 构建显示数据
    const categoryMap: Record<string, DishWithLikes[]> = {}
    filteredDishes.forEach(dish => {
      const dishLikes = likes.filter(l => l.dish_id === dish.id)
      const dishWithLikes = this.buildDishWithLikes(dish, dishLikes)

      if (!categoryMap[dish.category]) {
        categoryMap[dish.category] = []
      }
      categoryMap[dish.category].push(dishWithLikes)
    })

    const displayDishes: CategoryDishes[] = Object.entries(categoryMap).map(([category, dishes]) => ({
      category,
      dishes
    }))

    this.setData({
      displayDishes
    })
  },

  clearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.loadData()
  },

  toggleLike(e: any) {
    const { dishId } = e.currentTarget.dataset
    const { gathering, currentUser, gatheringId } = this.data

    // 检查是否可以点赞
    if (gathering.menu_locked) {
      wx.showToast({
        title: '菜单已锁定，无法点赞',
        icon: 'none'
      })
      return
    }

    if (gathering.status === GatheringStatus.FINISHED) {
      wx.showToast({
        title: '聚会已结束，无法点赞',
        icon: 'none'
      })
      return
    }

    const allLikes = getLikes()
    const existingLike = allLikes.find(
      l => l.gathering_id === gatheringId && l.dish_id === dishId && l.user_id === currentUser.id
    )

    if (existingLike) {
      // 取消点赞
      const newLikes = allLikes.filter(l => l.id !== existingLike.id)
      saveLikes(newLikes)
      
      wx.showToast({
        title: '已取消点赞',
        icon: 'none'
      })
    } else {
      // 添加点赞
      const newLike: Like = {
        id: `like_${Date.now()}`,
        gathering_id: gatheringId,
        dish_id: dishId,
        user_id: currentUser.id,
        created_at: new Date().toISOString()
      }
      
      allLikes.push(newLike)
      saveLikes(allLikes)
      
      wx.showToast({
        title: '点赞成功',
        icon: 'success'
      })
    }

    // 刷新数据
    this.loadData()
  },

  showLikedList() {
    this.updateLikedLists()
    const currentDrawerList = this.data.drawerTab === 'all' ? this.data.allLikedDishes : this.data.myLikedDishes
    this.setData({
      showDrawer: true,
      currentDrawerList
    })
  },

  hideDrawer() {
    this.setData({
      showDrawer: false
    })
  },

  switchDrawerTab(e: any) {
    const { tab } = e.currentTarget.dataset
    const currentDrawerList = tab === 'all' ? this.data.allLikedDishes : this.data.myLikedDishes
    this.setData({
      drawerTab: tab,
      currentDrawerList
    })
  },

  updateLikedLists() {
    const { gatheringId, currentUser, allDishes, drawerTab } = this.data
    const likes = getLikes().filter(l => l.gathering_id === gatheringId)

    // 获取所有被点赞的菜品
    const likedDishIds = Array.from(new Set(likes.map(l => l.dish_id)))
    const allLikedDishes: DishWithLikes[] = likedDishIds.map(dishId => {
      const dish = allDishes.find(d => d.id === dishId)!
      const dishLikes = likes.filter(l => l.dish_id === dishId)
      return this.buildDishWithLikes(dish, dishLikes)
    }).sort((a, b) => b.likeCount - a.likeCount)

    // 获取我点赞的菜品
    const myLikes = likes.filter(l => l.user_id === currentUser.id)
    const myLikedDishIds = myLikes.map(l => l.dish_id)
    const myLikedDishes: DishWithLikes[] = myLikedDishIds.map(dishId => {
      const dish = allDishes.find(d => d.id === dishId)!
      const dishLikes = likes.filter(l => l.dish_id === dishId)
      return this.buildDishWithLikes(dish, dishLikes)
    }).sort((a, b) => b.likeCount - a.likeCount)

    const currentDrawerList = drawerTab === 'all' ? allLikedDishes : myLikedDishes

    this.setData({
      allLikedDishes,
      myLikedDishes,
      currentDrawerList
    })
  },

  stopPropagation() {
    // 阻止事件冒泡
  }
})

