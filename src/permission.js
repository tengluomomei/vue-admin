import router from './router'
import store from './store'
import { Message } from 'element-ui' // 提示组件
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
// 从 cookie中获取token,登录有token, 没有
import { getToken } from '@/utils/auth' //  get token from cookie
// 得到页面的title
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// 配置白名单，不需要登录可直接访问
const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

// 全局前置路由守卫
router.beforeEach(async(to, from, next) => {
  // start progress bar 开启进度条
  NProgress.start()

  // set page title 给页面的title赋值
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  // 从cookie中获取token
  const hasToken = getToken()
  console.log(hasToken)
  if (hasToken) {
    // 有token,说明登录了
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      // 如果登录了，还要去登录页面，放行到首页
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // 已经登录了，但是要去其他页面
      // determine whether the user has obtained his permission roles through getInfo
      // 如果登录了，会调用接口，拿到当前用户的一个角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log(hasRoles)
      if (hasRoles) {
        // 从vuex中获取角色，直接放行
        next()
      } else {
        // vuex中没有角色（vuex中的数据存储在内存中）
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          // 重新获取用户信息，role表示用户信息
          const { roles } = await store.dispatch('user/getInfo')
          console.log(roles)
          // generate accessible routes map based on roles
          // 根据用户信息生成路由规则，至于怎么生成，暂时不管
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          console.log(accessRoutes)
          // dynamically add accessible routes
          // 把路由规则添加到路由器中
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          // 规则已经添加到路由器中了，放行，此时有权限就可以看到页面了
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          // 如果生成规则出错了，清除token,重新回到登录页面
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    // 没有token看看，访问的路径有没有在白名单里
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      // 如果在就放行
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // 没有在白名单里面，需要登录，放行到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

// 全局后置路由守卫
router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
