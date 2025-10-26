// 表单验证工具

export function validateGatheringForm(data: {
  name: string
  date: string
  time: string
  location: string
}): { valid: boolean; message: string } {
  if (!data.name.trim()) {
    return { valid: false, message: '请输入聚会名称' }
  }

  if (data.name.length > 50) {
    return { valid: false, message: '聚会名称不能超过50个字符' }
  }

  if (!data.date || !data.time) {
    return { valid: false, message: '请选择聚会时间' }
  }

  const datetime = new Date(`${data.date}T${data.time}:00Z`)
  if (datetime < new Date()) {
    return { valid: false, message: '聚会时间不能早于当前时间' }
  }

  if (!data.location.trim()) {
    return { valid: false, message: '请输入聚会地点' }
  }

  if (data.location.length > 100) {
    return { valid: false, message: '聚会地点不能超过100个字符' }
  }

  return { valid: true, message: '' }
}

export function validateDishForm(data: {
  image_url: string
  name: string
  category: string
  ingredients: any[]
  cooking_method: string
}): { valid: boolean; message: string } {
  if (!data.image_url) {
    return { valid: false, message: '请上传菜品图片' }
  }

  if (!data.name.trim()) {
    return { valid: false, message: '请输入菜品名称' }
  }

  if (data.name.length > 50) {
    return { valid: false, message: '菜品名称不能超过50个字符' }
  }

  if (!data.category) {
    return { valid: false, message: '请选择菜品分类' }
  }

  const validIngredients = data.ingredients.filter((ing: any) => ing.name.trim())
  if (validIngredients.length === 0) {
    return { valid: false, message: '请至少添加一个原材料' }
  }

  if (!data.cooking_method.trim()) {
    return { valid: false, message: '请输入制作方法' }
  }

  if (data.cooking_method.length > 1000) {
    return { valid: false, message: '制作方法不能超过1000个字符' }
  }

  return { valid: true, message: '' }
}


