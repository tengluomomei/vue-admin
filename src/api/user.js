import request from '@/utils/request'

// 登录接口
export function login(data) {
  return request({
    // url: '/vue-element-admin/user/login',
    url: '/site/login',
    method: 'post',
    data
  })
}

// 获取用户信息接口
export function getInfo(data) {
  return request({
    // url: '/vue-element-admin/user/info',
    url: '/site/check-login',
    method: 'post',
    data
  })
}

// 退出登录接口
export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
