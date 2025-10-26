// pages/gatherings/gatherings.ts
import { getGatherings, saveGatherings, getCurrentUser } from '../../utils/storage'
import { formatDate, getGatheringStatusText, getCurrentISOTime } from '../../utils/date'
import { Gathering, GatheringStatus, PreparationStage, UserRole } from '../../utils/types'

interface FormData {
  name: string
  date: string
  time: string
  location: string
}

Page({
  data: {
    gatherings: [] as Gathering[],
    isAdmin: false,
    showDialog: false,
    dialogMode: 'create' as 'create' | 'edit',
    currentGatheringId: '',
    formData: {
      name: '',
      date: '',
      time: '',
      location: ''
    } as FormData
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const gatherings = getGatherings()
    const currentUser = getCurrentUser()
    
    this.setData({
      gatherings,
      isAdmin: currentUser.role === UserRole.ADMIN
    })
  },

  formatDate(dateStr: string): string {
    return formatDate(dateStr)
  },

  getStatusText(status: string): string {
    return getGatheringStatusText(status)
  },

  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'not_started': 'tag-success',
      'in_progress': 'tag-warning',
      'finished': 'tag-info'
    }
    return classMap[status] || 'tag-info'
  },

  stopPropagation(e: any) {
    // 阻止事件冒泡
  },

  goToOrdering(e: any) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/ordering/ordering?id=${id}`
    })
  },

  goToAddDish() {
    wx.navigateTo({
      url: '/pages/add-dish/add-dish'
    })
  },

  showActionSheet(e: any) {
    const { id } = e.currentTarget.dataset
    const gatherings = getGatherings()
    const gathering = gatherings.find(g => g.id === id)
    
    if (!gathering) return
    
    const itemList = []
    
    // 编辑聚会
    itemList.push('编辑聚会')
    
    // 删除聚会
    itemList.push('删除聚会')
    
    // 锁定/解锁菜单
    if (gathering.menu_locked) {
      itemList.push('解锁菜单')
    } else {
      itemList.push('锁定菜单')
    }
    
    // 标记为已结束
    if (gathering.status !== GatheringStatus.FINISHED) {
      itemList.push('标记为已结束')
    }
    
    // 备菜
    itemList.push('备菜')
    
    wx.showActionSheet({
      itemList,
      success: (res) => {
        const action = itemList[res.tapIndex]
        
        switch (action) {
          case '编辑聚会':
            this.editGathering(id)
            break
          case '删除聚会':
            this.deleteGathering(id)
            break
          case '锁定菜单':
            this.lockMenu(id)
            break
          case '解锁菜单':
            this.unlockMenu(id)
            break
          case '标记为已结束':
            this.finishGathering(id)
            break
          case '备菜':
            this.goToPreparation(id)
            break
        }
      }
    })
  },

  editGathering(id: string) {
    const gatherings = getGatherings()
    const gathering = gatherings.find(g => g.id === id)
    
    if (!gathering) return
    
    const datetime = new Date(gathering.time)
    const date = datetime.toISOString().split('T')[0]
    const time = `${String(datetime.getHours()).padStart(2, '0')}:${String(datetime.getMinutes()).padStart(2, '0')}`
    
    this.setData({
      showDialog: true,
      dialogMode: 'edit',
      currentGatheringId: id,
      formData: {
        name: gathering.name,
        date,
        time,
        location: gathering.location
      }
    })
  },

  deleteGathering(id: string) {
    wx.showModal({
      title: '确认删除',
      content: '确认删除该聚会吗？删除后将无法恢复，包括所有点赞记录和备菜信息。',
      confirmText: '确认删除',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          const gatherings = getGatherings()
          const newGatherings = gatherings.filter(g => g.id !== id)
          saveGatherings(newGatherings)
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          this.loadData()
        }
      }
    })
  },

  lockMenu(id: string) {
    const gatherings = getGatherings()
    const gathering = gatherings.find(g => g.id === id)
    
    if (gathering) {
      gathering.menu_locked = true
      gathering.updated_at = getCurrentISOTime()
      saveGatherings(gatherings)
      
      wx.showToast({
        title: '菜单已锁定',
        icon: 'success'
      })
      
      this.loadData()
    }
  },

  unlockMenu(id: string) {
    const gatherings = getGatherings()
    const gathering = gatherings.find(g => g.id === id)
    
    if (gathering) {
      gathering.menu_locked = false
      gathering.updated_at = getCurrentISOTime()
      saveGatherings(gatherings)
      
      wx.showToast({
        title: '菜单已解锁',
        icon: 'success'
      })
      
      this.loadData()
    }
  },

  finishGathering(id: string) {
    wx.showModal({
      title: '确认操作',
      content: '确认标记该聚会为已结束吗？',
      success: (res) => {
        if (res.confirm) {
          const gatherings = getGatherings()
          const gathering = gatherings.find(g => g.id === id)
          
          if (gathering) {
            gathering.status = GatheringStatus.FINISHED
            gathering.updated_at = getCurrentISOTime()
            saveGatherings(gatherings)
            
            wx.showToast({
              title: '已标记为已结束',
              icon: 'success'
            })
            
            this.loadData()
          }
        }
      }
    })
  },

  goToPreparation(id: string) {
    wx.navigateTo({
      url: `/pages/preparation/preparation?id=${id}`
    })
  },

  showCreateDialog() {
    this.setData({
      showDialog: true,
      dialogMode: 'create',
      currentGatheringId: '',
      formData: {
        name: '',
        date: '',
        time: '',
        location: ''
      }
    })
  },

  hideDialog() {
    this.setData({
      showDialog: false
    })
  },

  onInputName(e: any) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  onInputLocation(e: any) {
    this.setData({
      'formData.location': e.detail.value
    })
  },

  onDateChange(e: any) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  onTimeChange(e: any) {
    this.setData({
      'formData.time': e.detail.value
    })
  },

  submitForm() {
    const { formData, dialogMode, currentGatheringId } = this.data
    
    // 验证
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入聚会名称',
        icon: 'none'
      })
      return
    }
    
    if (!formData.date || !formData.time) {
      wx.showToast({
        title: '请选择聚会时间',
        icon: 'none'
      })
      return
    }
    
    if (!formData.location.trim()) {
      wx.showToast({
        title: '请输入聚会地点',
        icon: 'none'
      })
      return
    }
    
    // 合并日期和时间
    const datetime = `${formData.date}T${formData.time}:00Z`
    
    // 验证时间不能早于当前时间
    if (new Date(datetime) < new Date()) {
      wx.showToast({
        title: '聚会时间不能早于当前时间',
        icon: 'none'
      })
      return
    }
    
    const gatherings = getGatherings()
    const currentUser = getCurrentUser()
    
    if (dialogMode === 'create') {
      // 创建聚会
      const newGathering: Gathering = {
        id: `gathering_${Date.now()}`,
        name: formData.name.trim(),
        time: datetime,
        location: formData.location.trim(),
        status: GatheringStatus.NOT_STARTED,
        menu_locked: false,
        preparation_stage_id: PreparationStage.CONFIRM_DISHES,
        created_by: currentUser.id,
        created_at: getCurrentISOTime(),
        updated_at: getCurrentISOTime()
      }
      
      gatherings.unshift(newGathering)
      saveGatherings(gatherings)
      
      wx.showToast({
        title: '创建成功',
        icon: 'success'
      })
    } else {
      // 编辑聚会
      const gathering = gatherings.find(g => g.id === currentGatheringId)
      
      if (gathering) {
        gathering.name = formData.name.trim()
        gathering.time = datetime
        gathering.location = formData.location.trim()
        gathering.updated_at = getCurrentISOTime()
        
        saveGatherings(gatherings)
        
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
      }
    }
    
    this.hideDialog()
    this.loadData()
  }
})


