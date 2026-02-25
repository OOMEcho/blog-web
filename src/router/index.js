import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('../views/ArticleDetail.vue')
  },
  {
    path: '/category/:id',
    name: 'category',
    component: () => import('../views/CategoryList.vue')
  },
  {
    path: '/tag/:id',
    name: 'tag',
    component: () => import('../views/TagList.vue')
  },
  {
    path: '/archive',
    name: 'archive',
    component: () => import('../views/Archive.vue')
  },
  {
    path: '/about',
    name: 'about',
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

export default router
