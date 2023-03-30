import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    // 看一下，roles在route.meta.roles里面有没有，有返回true,没有返回false
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    // 如果没有mata,返回true,说明用户有权限访问路由规则
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = [] // 当前用户可访问的路由规则
  // 遍历所有的动态路由规则
  routes.forEach(route => {
    const tmp = { ...route }
    console.log(roles, tmp)
    // roles是角色，tmp是每一个规则
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        // 递归计算
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [], // 静态路由规则+当前用户可访问的动态路由规则
  addRoutes: [] // 当前用户可访问的动态路由规则
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 计算生成需要权限访问的动态路由规则
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes // 计算出生成需要权限访问的动态路由规则
      if (roles.includes('admin')) {
        // 如果包含admin，把所有的动态路由，赋值给accessedRoutes
        // admin用户不需要去计算可访问的动态路由
        accessedRoutes = asyncRoutes || []
      } else {
        // 不是admin,计算当前用户可访问的动态路由
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
