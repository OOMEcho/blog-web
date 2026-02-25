import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    blogConfig: null,
    categories: [],
    tags: []
  },
  getters: {
    blogConfig: state => state.blogConfig,
    categories: state => state.categories,
    tags: state => state.tags
  },
  mutations: {
    SET_BLOG_CONFIG (state, config) {
      state.blogConfig = config
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
      if (cfgRes.code === 200) commit('SET_BLOG_CONFIG', cfgRes.data)
      if (catRes.code === 200) commit('SET_CATEGORIES', catRes.data)
      if (tagRes.code === 200) commit('SET_TAGS', tagRes.data)
    }
  },
  modules: {}
})
