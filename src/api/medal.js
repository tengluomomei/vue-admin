import request from '@/utils/request'

/**
 * 勋章列表
 */
export function apiMedalList(data) {
  return request({
    url: '/user-medal/list',
    method: 'post',
    data
  })
}

/**
 * 创建勋章
 */
export function apiMedalCreate(data) {
  return request({
    url: '/user-medal/create',
    method: 'post',
    data
  })
}

/**
 * 修改勋章
 */
export function apiMedalUpdate(data) {
  return request({
    url: '/user-medal/update',
    method: 'post',
    data
  })
}

