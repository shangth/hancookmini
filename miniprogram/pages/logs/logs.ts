// logs.ts
import { formatDate } from '../../utils/date'

Page({
  data: {
    logs: [] as string[],
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log: number) => {
        return formatDate(new Date(log).toISOString())
      }),
    })
  },
})
