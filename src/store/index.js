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
      const [cfgRes, catRes, tagRes] = await Promise.all([
        getBlogConfig(),
        getCategories(),
        getTags()
      ])
      if (cfgRes && cfgRes.code === 200) {
        commit('SET_BLOG_CONFIG', cfgRes.data)
      } else {
        commit('SET_BLOG_CONFIG', [])
      }
      if (catRes && catRes.code === 200) {
        commit('SET_CATEGORIES', catRes.data)
      }
      if (tagRes && tagRes.code === 200) {
        commit('SET_TAGS', tagRes.data)
      }
    }
  },
  modules: {}
})
