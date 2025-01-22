class Cache {
    constructor() {
      this.data = new Map()
    }
  
    async get(key) {
      const item = this.data.get(key)
      if (!item) return null
      
      if (item.expiry && item.expiry < Date.now()) {
        this.data.delete(key)
        return null
      }
      
      return item.value
    }
  
    async set(key, value, ttl = 300) {
      this.data.set(key, {
        value,
        expiry: ttl ? Date.now() + (ttl * 1000) : null
      })
    }
  
    async del(key) {
      return this.data.delete(key)
    }
  
    async clear() {
      this.data.clear()
    }
  }
  
  export const cache = new Cache()