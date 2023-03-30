import Cookies from 'js-cookie'

const TokenKey = 'yd_admin_token'
const accessToken = 'accessToken'
const permission = 'permissions'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getAccessToken() {
  return Cookies.get(accessToken)
}

export function setAccessToken(token) {
  return Cookies.set(accessToken, token)
}

export function removeAccessToken() {
  return Cookies.remove(accessToken)
}

export function setPermissions(data) {
  return Cookies.set(permission, data)
}

export function getPermissions() {
  return Cookies.get(permission)
}

export function removePermissions() {
  return Cookies.remove(permission)
}
