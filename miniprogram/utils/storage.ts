// 本地存储工具函数
import { mockLikes, mockDishes, currentUser } from './mock-data'
import { Gathering, Like, Dish } from './types'

const STORAGE_KEY = {
  GATHERINGS: 'gatherings',
  LIKES: 'likes',
  DISHES: 'dishes',
  CURRENT_USER: 'current_user'
}

// 初始化存储
export function initStorage() {
  try {
    // 如果没有数据，则初始化
    if (!wx.getStorageSync(STORAGE_KEY.LIKES)) {
      wx.setStorageSync(STORAGE_KEY.LIKES, mockLikes)
    }
    if (!wx.getStorageSync(STORAGE_KEY.DISHES)) {
      wx.setStorageSync(STORAGE_KEY.DISHES, mockDishes)
    }
    if (!wx.getStorageSync(STORAGE_KEY.CURRENT_USER)) {
      wx.setStorageSync(STORAGE_KEY.CURRENT_USER, currentUser)
    }
  } catch (e) {
    console.error('初始化存储失败', e)
  }
}

// 聚会相关
export function getGatherings(): Gathering[] {
  return wx.getStorageSync(STORAGE_KEY.GATHERINGS) || []
}

export function saveGatherings(gatherings: Gathering[]) {
  wx.setStorageSync(STORAGE_KEY.GATHERINGS, gatherings)
}

export function getGatheringById(id: string): Gathering | undefined {
  const gatherings = getGatherings()
  return gatherings.find(g => g.id === id)
}

// 点赞相关
export function getLikes(): Like[] {
  return wx.getStorageSync(STORAGE_KEY.LIKES) || []
}

export function saveLikes(likes: Like[]) {
  wx.setStorageSync(STORAGE_KEY.LIKES, likes)
}

export function getLikesByGathering(gatheringId: string): Like[] {
  const likes = getLikes()
  return likes.filter(l => l.gathering_id === gatheringId)
}

// 菜品相关
export function getDishes(): Dish[] {
  return wx.getStorageSync(STORAGE_KEY.DISHES) || []
}

export function saveDishes(dishes: Dish[]) {
  wx.setStorageSync(STORAGE_KEY.DISHES, dishes)
}

// 用户相关
export function getCurrentUser() {
  return wx.getStorageSync(STORAGE_KEY.CURRENT_USER) || currentUser
}

// 清空所有数据（用于测试）
export function clearAllStorage() {
  wx.removeStorageSync(STORAGE_KEY.GATHERINGS)
  wx.removeStorageSync(STORAGE_KEY.LIKES)
  wx.removeStorageSync(STORAGE_KEY.DISHES)
}


