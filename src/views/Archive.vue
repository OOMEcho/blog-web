<template>
  <div class="page-archive">
    <div class="page-inner">
      <main class="main-content">
        <h1 class="page-title">
          <i class="el-icon-collection" /> 归档
          <span class="count">（共 {{ articles.length }} 篇）</span>
        </h1>

        <div v-loading="loading">
          <div
            v-for="(group, year) in groupedArticles"
            :key="year"
            class="year-group"
          >
            <h2 class="year-label">{{ year }}</h2>
            <ul class="article-list">
              <li
                v-for="article in group"
                :key="article.id"
                @click="$router.push(`/article/${article.id}`)"
                class="article-item"
              >
                <span class="date">{{ formatDate(article.createTime, 'MM-DD') }}</span>
                <span class="title">{{ article.title }}</span>
              </li>
            </ul>
          </div>
        </div>

        <el-empty v-if="!loading && articles.length === 0" description="暂无归档文章" />
      </main>
      <app-sidebar class="sidebar" />
    </div>
  </div>
</template>

<script>
import AppSidebar from '../components/AppSidebar.vue'
import { getArchives } from '@/api/blog'
import { formatDate } from '@/utils/format'

export default {
  name: 'ArchiveView',
  components: { AppSidebar },
  data () {
    return {
      articles: [],
      loading: false
    }
  },
  computed: {
    groupedArticles () {
      const groups = {}
      this.articles.forEach(article => {
        const year = new Date(article.createTime).getFullYear()
        if (!groups[year]) groups[year] = []
        groups[year].push(article)
      })
      // 按年份降序
      return Object.keys(groups)
        .sort((a, b) => b - a)
        .reduce((acc, year) => { acc[year] = groups[year]; return acc }, {})
    }
  },
  created () {
    this.fetchArchives()
  },
  methods: {
    formatDate,
    async fetchArchives () {
      this.loading = true
      try {
        const res = await getArchives()
        this.articles = Array.isArray(res) ? res : []
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
.page-archive {
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
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 32px;
  .count { font-size: 15px; color: #909399; font-weight: 400; }
}
.year-group {
  margin-bottom: 32px;
  .year-label {
    font-size: 20px;
    font-weight: 700;
    color: #409EFF;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e8f4ff;
  }
}
.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
  .article-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 8px;
    border-bottom: 1px dashed #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
      background: #f5f7fa;
      .title { color: #409EFF; }
    }
    .date {
      font-size: 13px;
      color: #909399;
      white-space: nowrap;
      min-width: 50px;
    }
    .title {
      font-size: 15px;
      color: #303133;
    }
  }
}
@media (max-width: 800px) {
  .page-inner { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
</style>
