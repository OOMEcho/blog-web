import axios from 'axios'
import { Message } from 'element-ui'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
})

service.interceptors.response.use(
  response => {
    const res = response.data
    // 后端直接返回数据（非统一包装）时直接返回
    if (res === undefined || res === null) return res
    // 统一响应格式 { code, msg, data }
    if (res.code !== undefined && res.code !== 200) {
      Message({ message: res.msg || '请求失败', type: 'error', duration: 3000 })
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    Message({ message: error.message || '网络异常', type: 'error', duration: 3000 })
    return Promise.reject(error)
  }
)

export default service
