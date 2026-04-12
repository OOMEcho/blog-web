import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    meta: { title: '首页' },
    component: () => import('../views/Home.vue')
  },
  {
    path: '/article/:id',
    name: 'article',
    meta: { title: '文章详情' },
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/category/:id',
    name: 'category',
    meta: { title: '分类' },
    component: () => import('../views/CategoryList.vue')
  },
  {
    path: '/tag/:id',
    name: 'tag',
    meta: { title: '标签' },
    component: () => import('../views/TagList.vue')
  },
  {
    path: '/archive',
    name: 'archive',
    meta: { title: '归档' },
    component: () => import('../views/Archive.vue')
  },
  {
    path: '/about',
    name: 'about',
    meta: { title: '关于我' },
    component: () => import('../views/About.vue')
  },
  {
    path: '/links',
    name: 'links',
    meta: { title: '友链' },
    component: () => import('../views/Links.vue')
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
  document.title = (to.meta && to.meta.title) || process.env.VUE_APP_TITLE || '首页'
})

export default router
