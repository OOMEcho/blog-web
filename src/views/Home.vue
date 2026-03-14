<template>
  <div class="page-home">
    <div class="page-inner">
      <main class="main-content">
        <!-- 搜索结果提示 -->
        <div v-if="keyword" class="search-hint">
          <i class="el-icon-search" /> 搜索 "{{ keyword }}" 的结果（{{ total }} 篇）
        </div>

        <!-- 文章列表 -->
        <div v-loading="loading">
          <article-card
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />

        <!-- 分页 -->
        <el-pagination
          v-if="total > pageSize"
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="fetchArticles"
          class="pagination"
        />
      </main>
      <app-sidebar class="sidebar" />
    </div>
  </div>
</template>

<script>
import ArticleCard from '../components/ArticleCard.vue'
import AppSidebar from '../components/AppSidebar.vue'
import { getArticles, searchArticles } from '@/api/blog'

export default {
  name: 'HomeView',
  components: { ArticleCard, AppSidebar },
  data () {
    return {
      articles: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      loading: false
    }
  },
  computed: {
    keyword () {
      return this.$route.query.keyword || ''
    }
  },
  watch: {
    '$route.query': {
      handler () {
        this.currentPage = 1
        this.fetchArticles()
      }
    }
  },
  created () {
    this.fetchArticles()
  },
  methods: {
    async fetchArticles () {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }
        let res
        if (this.keyword) {
          params.keyword = this.keyword
          res = await searchArticles(params)
        } else {
          res = await getArticles(params)
        }
        // 兼容 PageVO 结构（records + total）和直接列表
        if (res && res.data) {
          this.articles = res.data.records || res.data || []
          this.total = res.data.total || this.articles.length
        } else {
          this.articles = []
          this.total = 0
        }
      } catch (e) {
        this.articles = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-home {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px;
}

.page-inner {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

.search-hint {
  margin-bottom: 20px;
  font-size: 15px;
  color: #606266;
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

@media (max-width: 800px) {
  .page-inner {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
}
</style>
