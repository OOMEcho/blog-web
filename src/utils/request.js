import axios from 'axios'
import { Message } from 'element-ui'

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? process.env.VUE_APP_BASE_API
    : process.env.VUE_APP_BASE_PRE,
  timeout: 10000,
  validateStatus: () => true
})

service.interceptors.request.use(
  config => {
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    if (response.config && response.config.responseType === 'blob') {
      return response.data
    }

    const payload = response.data

    if (!payload || typeof payload !== 'object') {
      if (response.status >= 400) {
        const message = '服务不可用，请稍后重试'
        Message({ message, type: 'error', duration: 3000 })
        return Promise.reject(new Error(message))
      }
      return payload
    }

    const { code, data, msg, message } = payload

    if (response.status >= 400 && code === undefined) {
      const errorMsg = message || msg || '服务不可用，请稍后重试'
      Message({ message: errorMsg, type: 'error', duration: 3000 })
      return Promise.reject(new Error(errorMsg))
    }

    if (code !== undefined && code !== 200) {
      const errorMsg = msg || message || '请求失败'
      Message({ message: errorMsg, type: 'error', duration: 3000 })
      return Promise.reject(new Error(errorMsg))
    }

    if (code === 200) {
      return data
    }

    return payload
  },
  error => {
    const status = error && error.response && error.response.status
    if (status && status >= 400) {
      Message({ message: '服务不可用，请稍后重试', type: 'error', duration: 3000 })
      return Promise.reject(error)
    }

    Message({ message: error.message || '网络异常', type: 'error', duration: 3000 })
    return Promise.reject(error)
  }
)

export default service
