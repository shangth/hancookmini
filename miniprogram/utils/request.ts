/**
 * 公共请求方法
 * 封装微信小程序的 wx.request API
 */

// 请求配置接口
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT'
  data?: any
  header?: Record<string, string>
  timeout?: number
  enableHttp2?: boolean
  enableQuic?: boolean
}

// 响应数据接口
export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

// 请求响应接口
export interface RequestResponse<T = any> {
  data: ResponseData<T>
  statusCode: number
  header: Record<string, string>
}

// 基础配置
const BASE_CONFIG = {
  timeout: 10000,
  header: {
    'Content-Type': 'application/json'
  }
}

// 基础 URL（可根据环境配置）
let baseURL = 'http://192.168.1.6:3333'

/**
 * 获取完整 URL
 */
function getFullURL(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return baseURL + url
}

/**
 * 请求拦截器
 */
function requestInterceptor(config: RequestConfig): RequestConfig {
  // 添加 token
  const token = wx.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加公共参数
  config.header = {
    ...BASE_CONFIG.header,
    ...config.header
  }
  
  return config
}

/**
 * 响应拦截器
 */
function responseInterceptor<T>(response: RequestResponse<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const { statusCode, data } = response
    
    // HTTP 状态码检查
    if (statusCode >= 200 && statusCode < 300) {
      // 业务状态码检查
      if (data.code === 0 || data.code === 200) {
        resolve(data.data)
      } else {
        // 业务错误
        wx.showToast({
          title: data.message || '请求失败',
          icon: 'none'
        })
        reject(new Error(data.message || '请求失败'))
      }
    } else if (statusCode === 401) {
      // 未授权，清除 token 并跳转登录
      wx.removeStorageSync('token')
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      // 可以在这里添加跳转到登录页的逻辑
      reject(new Error('未授权'))
    } else if (statusCode === 403) {
      wx.showToast({
        title: '没有权限访问',
        icon: 'none'
      })
      reject(new Error('没有权限'))
    } else if (statusCode >= 500) {
      wx.showToast({
        title: '服务器错误，请稍后重试',
        icon: 'none'
      })
      reject(new Error('服务器错误'))
    } else {
      wx.showToast({
        title: '网络错误，请检查网络连接',
        icon: 'none'
      })
      reject(new Error('网络错误'))
    }
  })
}

/**
 * 核心请求方法
 */
function request<T = any>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const finalConfig = requestInterceptor(config)
    
    wx.request({
      url: getFullURL(finalConfig.url),
      method: finalConfig.method || 'GET',
      data: finalConfig.data,
      header: finalConfig.header,
      timeout: finalConfig.timeout || BASE_CONFIG.timeout,
      success: (res) => {
        responseInterceptor(res as unknown as RequestResponse<T>)
          .then(resolve)
          .catch(reject)
      },
      fail: (err) => {
        console.error('请求失败:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    data: params,
    ...config
  })
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    data: params,
    ...config
  })
}

/**
 * 文件上传
 */
// export function uploadFile(config: {
//   url: string
//   filePath: string
//   name: string
//   formData?: Record<string, any>
//   header?: Record<string, string>
// }): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const token = wx.getStorageSync('token')
//     const header = {
//       ...config.header
//     }
    
//     if (token) {
//       header['Authorization'] = `Bearer ${token}`
//     }
    
//     wx.uploadFile({
//       url: getFullURL(config.url),
//       filePath: config.filePath,
//       name: config.name,
//       formData: config.formData,
//       header,
//       success: (res) => {
//         try {
//           const data = JSON.parse(res.data)
//           if (data.code === 0 || data.code === 200) {
//             resolve(data.data)
//           } else {
//             wx.showToast({
//               title: data.message || '上传失败',
//               icon: 'none'
//             })
//             reject(new Error(data.message || '上传失败'))
//           }
//         } catch (error) {
//           reject(error)
//         }
//       },
//       fail: (err) => {
//         console.error('文件上传失败:', err)
//         wx.showToast({
//           title: '文件上传失败',
//           icon: 'none'
//         })
//         reject(err)
//       }
//     })
//   })
// }

// 默认导出
export default {
  get,
  post,
  put,
  delete: del,
  request
}
