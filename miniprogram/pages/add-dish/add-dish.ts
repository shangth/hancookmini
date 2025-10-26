// pages/add-dish/add-dish.ts
import { getDishes, saveDishes, getCurrentUser } from '../../utils/storage'
import { Dish, DishType, Ingredient } from '../../utils/types'

interface FormData {
  image_url: string
  name: string
  category: string
  type: DishType
  ingredients: Ingredient[]
  cooking_method: string
  notes: string
}

Page({
  data: {
    formData: {
      image_url: '',
      name: '',
      category: '',
      type: DishType.MULTI_SERVING,
      ingredients: [{ name: '', quantity: '' }],
      cooking_method: '',
      notes: ''
    } as FormData,
    categories: ['川菜', '粤菜', '家常菜', '饮品', '甜点', '汤品'],
    categoryIndex: -1,
    showCategoryDialog: false,
    newCategory: ''
  },

  onLoad() {
    // 初始化
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 实际项目中需要上传到服务器
        // 这里使用本地临时路径模拟
        this.setData({
          'formData.image_url': res.tempFilePaths[0]
        })
      }
    })
  },

  removeImage() {
    this.setData({
      'formData.image_url': ''
    })
  },

  onInputName(e: any) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  onCategoryChange(e: any) {
    const index = e.detail.value
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categories[index]
    })
  },

  showAddCategory() {
    this.setData({
      showCategoryDialog: true,
      newCategory: ''
    })
  },

  hideCategoryDialog() {
    this.setData({
      showCategoryDialog: false
    })
  },

  onInputNewCategory(e: any) {
    this.setData({
      newCategory: e.detail.value
    })
  },

  confirmAddCategory() {
    const { newCategory, categories } = this.data
    
    if (!newCategory.trim()) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      })
      return
    }
    
    if (categories.includes(newCategory.trim())) {
      wx.showToast({
        title: '分类已存在',
        icon: 'none'
      })
      return
    }
    
    const newCategories = [...categories, newCategory.trim()]
    
    this.setData({
      categories: newCategories,
      categoryIndex: newCategories.length - 1,
      'formData.category': newCategory.trim(),
      showCategoryDialog: false
    })
  },

  onTypeChange(e: any) {
    this.setData({
      'formData.type': e.detail.value as DishType
    })
  },

  addIngredient() {
    const ingredients = [...this.data.formData.ingredients, { name: '', quantity: '' }]
    this.setData({
      'formData.ingredients': ingredients
    })
  },

  removeIngredient(e: any) {
    const { index } = e.currentTarget.dataset
    const ingredients = this.data.formData.ingredients.filter((_, i) => i !== index)
    
    // 至少保留一个
    if (ingredients.length === 0) {
      wx.showToast({
        title: '至少需要一个原材料',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      'formData.ingredients': ingredients
    })
  },

  onIngredientNameChange(e: any) {
    const { index } = e.currentTarget.dataset
    const value = e.detail.value
    const ingredients = [...this.data.formData.ingredients]
    ingredients[index].name = value
    
    this.setData({
      'formData.ingredients': ingredients
    })
  },

  onIngredientQuantityChange(e: any) {
    const { index } = e.currentTarget.dataset
    const value = e.detail.value
    const ingredients = [...this.data.formData.ingredients]
    ingredients[index].quantity = value
    
    this.setData({
      'formData.ingredients': ingredients
    })
  },

  onInputCookingMethod(e: any) {
    this.setData({
      'formData.cooking_method': e.detail.value
    })
  },

  onInputNotes(e: any) {
    this.setData({
      'formData.notes': e.detail.value
    })
  },

  submitForm() {
    const { formData } = this.data
    
    // 验证
    if (!formData.image_url) {
      wx.showToast({
        title: '请上传菜品图片',
        icon: 'none'
      })
      return
    }
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入菜品名称',
        icon: 'none'
      })
      return
    }
    
    if (!formData.category) {
      wx.showToast({
        title: '请选择菜品分类',
        icon: 'none'
      })
      return
    }
    
    // 验证原材料
    const validIngredients = formData.ingredients.filter(ing => ing.name.trim())
    if (validIngredients.length === 0) {
      wx.showToast({
        title: '请至少添加一个原材料',
        icon: 'none'
      })
      return
    }
    
    if (!formData.cooking_method.trim()) {
      wx.showToast({
        title: '请输入制作方法',
        icon: 'none'
      })
      return
    }
    
    // 检查菜品名称是否重复
    const dishes = getDishes()
    if (dishes.some(d => d.name === formData.name.trim())) {
      wx.showToast({
        title: '菜品名称已存在',
        icon: 'none'
      })
      return
    }
    
    // 创建菜品
    const currentUser = getCurrentUser()
    const newDish: Dish = {
      id: `dish_${Date.now()}`,
      name: formData.name.trim(),
      image_url: formData.image_url,
      category: formData.category,
      type: formData.type,
      ingredients: validIngredients,
      cooking_method: formData.cooking_method.trim(),
      notes: formData.notes.trim(),
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    }
    
    dishes.push(newDish)
    saveDishes(dishes)
    
    wx.showToast({
      title: '菜品添加成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  stopPropagation() {
    // 阻止事件冒泡
  }
})


