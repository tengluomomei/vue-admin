import router from '../router/index'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import qs from 'qs'
import { Message } from 'element-ui'
import { getToken, removeToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    config.headers['content-type'] = 'application/x-www-form-urlencoded'
    if (config.method.toLocaleLowerCase() === 'post' ||
      config.method.toLocaleLowerCase() === 'put' ||
      config.method.toLocaleLowerCase() === 'delete') {
      // 接口签名
      config.data['token'] = getToken() || 'login'
      config.data['timestamp'] = Date.parse(new Date()) / 1000
      const paramData = sortObjByASCII(config.data)
      let sign = ''
      for (const item in paramData) {
        sign += `${item}=${paramData[item]}&`
      }
      sign = `${sign}key=${process.env.VUE_APP_SECRET_KEY}`
      paramData.sign = CryptoJS.MD5(sign).toString()
      config.data = qs.stringify(paramData)
    }
    if (config.method.toLocaleLowerCase() === 'get') {
      config.params = {
        ...config.params
      }
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (res.retCode !== 0) {
      Message({
        message: res.retMsg || '请求错误',
        type: 'error',
        duration: 5 * 1000
      })
      if (res.retCode === 100012 || res.retCode === 100003) {
        router.push('/401')
      } else if (res.retCode === 100000) {
        removeToken()
        router.push('/login')
      }
      return Promise.reject(new Error(res.retMsg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.response.data.retMsg,
      type: 'error',
      duration: 5 * 1000
    })
    router.push('/login')
    return Promise.reject(error)
  }
)

/**
 * 将参数以ASCII码排序
 * @param params
 * @return {{}}
 */
const sortObjByASCII = function(params) {
  const keysArr = Object.keys(params).sort()
  const sortObj = {}
  for (const i in keysArr) {
    sortObj[keysArr[i]] = params[keysArr[i]]
  }
  return sortObj
}
export default service
