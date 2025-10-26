// components/navigation-bar/navigation-bar.ts
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    showBack: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 0
      })
    }
  },

  methods: {
    onBack() {
      wx.navigateBack()
    }
  }
})
