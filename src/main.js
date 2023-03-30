import Vue from 'vue'

import Cookies from 'js-cookie'

// 引入重置样式
import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
// 引入国际包，做国际化处理
import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

// 引入自己写的css
import '@/styles/index.scss' // global css

// 引入app组件
import App from './App'
import store from './store'
import router from './router'

// 引入自己封装的icon
import './icons' // icon
// 引入权限模块，非常重要
// import './permission' // permission control
import './permission_new' // permission control
import './utils/error-log' // error log

// 引入过滤器
import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */

// node 环境变量
// if (process.env.NODE_ENV === 'production') {
//   // 导入mock模块，模拟接口的
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  locale: enLang // 如果使用中文，无需设置，请删除
})

// 注册全局过滤器
// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 关闭生产环境下，vue的提示
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
