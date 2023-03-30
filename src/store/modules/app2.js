import Cookies from 'js-cookie'
import { getInfo, login } from '@/api/user'
import { setPermissions, setToken } from '@/utils/auth'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  permissions: {
    reload: true,
    is_system_admin: 0,
    page: {
      'admin-user_list': false, // 管理员用户列表
      'admin_dashboard': false, // 首页
      'rbac_role-list': false, // 角色列表
      'rbac_permission-list': false, // 权限列表
      'user-app-auth_list': false, // 用户权限列表
      'user-medal_list': false, // 勋章列表
      'rbac_create-role': false, // 创建角色
      'rbac_update-role': false // 修改角色
    },
    button: {
      'user-medal_create': false,
      'admin-user_create': false, // 创建用户
      'admin-user_delete': false, // 删除用户
      'admin-user_get-brief-info': false, // 获取管理员简要信息
      'admin-user_update': false, // 修改用户信息
      'admin-user_update-password': false, // 修改管理员密码)
      'rbac_create-permission': false, // 创建权限
      'rbac_update-permission': false, // 修改权限
      'rbac_delete-permission': false, // 删除权限
      'rbac_get-permission': false, // 查看权限信息
      'rbac_get-role': false, // 查看角色信息
      'rbac_get-user-role': false, // 查看权限用户角色
      'rbac_set-user-role': false, // 设置权限用户角色
      'rbac_create-role': false, // 创建角色
      'rbac_update-role': false, // 修改角色
      'rbac_delete-role': false, // 删除角色
      'user-app-auth_create': false, // 创建用户权限
      'user-app-auth_update': false, // 编辑用户权限
      'user-app-auth_delete': false, // 删除用户权限
      'sync-redis_sync-rolenode': false // 手动同步用户权限角色和节点
    }
  },
  device: 'desktop',
  roles: null
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  checkPermissions({ commit, state }, permissions) {
    console.log(permissions)
    state.permissions.reload = false
    state.permissions.system_admin = permissions.user.system_admin

    if (state.permissions.system_admin === 1) {
      for (const j in state.permissions.page) {
        Object.defineProperty(state.permissions.page, j, {
          value: true
        })
      }
      for (const i in state.permissions.button) {
        Object.defineProperty(state.permissions.button, i, {
          value: true
        })
      }
    } else {
      for (const j in state.permissions.page) {
        permissions.permission.map((item) => {
          if (item === j) {
            Object.defineProperty(state.permissions.page, j, {
              value: true
            })
          }
        })
      }

      for (const i in state.permissions.button) {
        permissions.permission.map((item) => {
          if (item === i) {
            Object.defineProperty(state.permissions.button, i, {
              value: true
            })
          }
        })
      }
    }
  },
  checkUserLogin({ commit, state }, hasToken) {
    return new Promise((resolve, reject) => {
      const data = {
        token: hasToken
      }
      getInfo(data).then(response => {
        const data = response
        setPermissions(data.data.user)
        resolve(data.data)
        commit('SET_ROLES', data.data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      // const md5_passwd = CryptoJS.MD5(password).toString()
      const postArgs = {
        username: username,
        password: password
      }
      login(postArgs).then(response => {
        setToken(response.data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
