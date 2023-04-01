import router from './router'
import store from './store'
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
      console.log(store.getters.permissions.reload)
      if (store.getters.permissions.reload) {
        if (to.path !== '/login') {
          await store.dispatch('app2/checkUserLogin', hasToken)
          await store.dispatch('app2/checkPermissions', store.getters.roles)
          next()
        } else {
          next()
        }
      } else {
        next()
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
