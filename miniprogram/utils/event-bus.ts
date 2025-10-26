// 简单的事件总线，用于模拟 WebSocket 实时通信

type EventHandler = (data: any) => void

class EventBus {
  private events: Record<string, EventHandler[]> = {}

  on(event: string, handler: EventHandler) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off(event: string, handler: EventHandler) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(h => h !== handler)
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return
    this.events[event].forEach(handler => handler(data))
  }

  clear() {
    this.events = {}
  }
}

export const eventBus = new EventBus()

// 事件类型
export const Events = {
  LIKE_UPDATED: 'like_updated',
  MENU_LOCKED: 'menu_locked',
  MENU_UNLOCKED: 'menu_unlocked',
  GATHERING_UPDATED: 'gathering_updated',
  GATHERING_DELETED: 'gathering_deleted',
  GATHERING_STATUS_CHANGED: 'gathering_status_changed'
}


