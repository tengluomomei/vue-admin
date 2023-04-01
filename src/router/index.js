import Vue from 'vue'
import Router from 'vue-router'

// 路由是个插件，需要use
Vue.use(Router)

/* Layout */
// 引入layout组件，非常重要，一级路由出口匹配layout组件
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'
import bikRouter from './modules/bik'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
// 静态路由:所有用户都可以访问，不需要权限
// component: Layout: 访问的出口中放什么组件，一级路由出口中放Layout组件
// hidden: true: 在侧边栏不能显示路由导航
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        // 在二级路由出口中放 /views/redirect/index
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    // 当访问login,在一级路由出口放置登录页面
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/documentation',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/documentation/index'),
        name: 'Documentation',
        meta: { title: 'Documentation', icon: 'documentation', affix: true }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'Guide', icon: 'guide', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/medal',
    component: Layout,
    redirect: '/medal/list',
    name: 'Medal',
    meta: {
      title: '勋章管理',
      icon: 'el-icon-collection'
    },
    alwaysShow: true,
    children: [
      {
        path: 'list',
        component: () => import('@/views/medal/list'),
        name: 'MedalList',
        meta: { title: '勋章列表', permission: ['user-medal_list'] }
      }
    ]
  },
  {
    path: '/authorize',
    component: Layout,
    redirect: '/authorize/roleList',
    name: 'authorize',
    meta: {
      title: '授权管理',
      icon: 'el-icon-lock'
    },
    alwaysShow: true,
    children: [
      {
        path: 'roleList',
        component: () => import('@/views/authorize/roleList'),
        name: 'RoleList',
        meta: { title: '角色列表', permission: ['rbac_role-list'] }
      },
      {
        path: 'roleAdd',
        component: () => import('@/views/authorize/roleAdd'),
        name: 'RoleAdd',
        meta: { title: '添加角色', permission: ['rbac_create-role'] },
        hidden: true
      },
      {
        path: 'roleEdit/:id',
        component: () => import('@/views/authorize/roleEdit'),
        name: 'RoleEdit',
        meta: { title: '编辑角色', permission: ['rbac_update-role'] },
        hidden: true
      },
      {
        path: 'permissionList',
        component: () => import('@/views/authorize/permissionList'),
        name: 'PermissionList',
        meta: { title: '权限列表', permission: ['rbac_permission-list'] }
      },
      {
        path: 'user',
        component: () => import('@/views/authorize/userList'),
        name: 'AuthorizeUser',
        meta: { title: '管理员列表', permission: ['admin-user_list'] }
      }

    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
// 动态路由：有权限才可以访问
export const asyncRoutes = [
  /** when your routing map is too long, you can split it into small modules **/
  // componentsRouter,
  // chartsRouter,
  // nestedRouter,
  // tableRouter,
  // ...bikRouter,

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

// 创建一个路由对象 router
const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
