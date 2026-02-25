<template>
  <div class="page-tag">
    <div class="page-inner">
      <main class="main-content">
        <div class="page-title" v-if="tagName">
          <i class="el-icon-price-tag" /> 标签：{{ tagName }}
          <span class="count">（{{ total }} 篇）</span>
        </div>
        <div v-loading="loading">
          <article-card
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>
        <el-empty v-if="!loading && articles.length === 0" description="该标签下暂无文章" />
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
import { getArticles } from '@/api/blog'

export default {
  name: 'TagList',
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
    tagId () {
      return this.$route.params.id
    },
    tagName () {
      const tags = this.$store.getters.tags || []
      const tag = tags.find(t => String(t.id) === String(this.tagId))
      return tag ? tag.name : ''
    }
  },
  watch: {
    '$route.params.id' () {
      this.currentPage = 1
      this.fetchArticles()
    }
  },
  created () {
    this.fetchArticles()
  },
  methods: {
    async fetchArticles () {
      this.loading = true
      try {
        const res = await getArticles({
          page: this.currentPage,
          size: this.pageSize,
          tagId: this.tagId
        })
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
.page-tag {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px;
}
.page-inner {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  .count { font-size: 14px; color: #909399; font-weight: 400; }
}
.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}
@media (max-width: 800px) {
  .page-inner { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
</style>
