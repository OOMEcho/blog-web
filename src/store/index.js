import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    blogConfig: [],
    configMap: {},
    categories: [],
    tags: []
  },
  getters: {
    blogConfig: state => state.blogConfig,
    configMap: state => state.configMap,
    categories: state => state.categories,
    tags: state => state.tags
  },
  mutations: {
    SET_BLOG_CONFIG (state, config) {
      const list = Array.isArray(config) ? config : []
      state.blogConfig = list
      state.configMap = list.reduce((acc, item) => {
        acc[item.configKey] = item.configValue
        return acc
      }, {})
    },
    SET_CATEGORIES (state, list) {
      state.categories = list
    },
    SET_TAGS (state, list) {
      state.tags = list
    }
  },
  actions: {
    async fetchBlogConfig ({ commit }) {
      const { getBlogConfig, getCategories, getTags } = await import('../api/blog')
      const results = await Promise.allSettled([
        getBlogConfig(),
        getCategories(),
        getTags()
      ])

      const cfgRes = results[0].status === 'fulfilled' ? results[0].value : []
      const catRes = results[1].status === 'fulfilled' ? results[1].value : []
      const tagRes = results[2].status === 'fulfilled' ? results[2].value : []

      commit('SET_BLOG_CONFIG', cfgRes)
      commit('SET_CATEGORIES', Array.isArray(catRes) ? catRes : [])
      commit('SET_TAGS', Array.isArray(tagRes) ? tagRes : [])
    }
  },
  modules: {}
})
