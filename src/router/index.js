import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    meta: { title: '\u9996\u9875' },
    component: () => import('../views/Home.vue')
  },
  {
    path: '/article/:id',
    name: 'article',
    meta: { title: '\u6587\u7ae0\u8be6\u60c5' },
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/category/:id',
    name: 'category',
    meta: { title: '\u5206\u7c7b' },
    component: () => import('../views/CategoryList.vue')
  },
  {
    path: '/tag/:id',
    name: 'tag',
    meta: { title: '\u6807\u7b7e' },
    component: () => import('../views/TagList.vue')
  },
  {
    path: '/archive',
    name: 'archive',
    meta: { title: '\u5f52\u6863' },
    component: () => import('../views/Archive.vue')
  },
  {
    path: '/about',
    name: 'about',
    meta: { title: '\u5173\u4e8e\u6211' },
    component: () => import('../views/About.vue')
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.afterEach((to) => {
  if (typeof document === 'undefined') {
    return
  }
  document.title = (to.meta && to.meta.title) || process.env.VUE_APP_TITLE || '\u9996\u9875'
})

export default router
