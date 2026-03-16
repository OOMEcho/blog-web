<template>
  <div class="page-home">
    <div class="page-inner">
      <main class="main-content">
        <section class="home-top">
          <h1>{{ configMap.site_name || '我的博客' }}</h1>
          <p>{{ configMap.site_notice || '记录学习、思考与实践，欢迎一起交流。' }}</p>
        </section>

        <div v-if="keyword" class="search-hint">
          <i class="el-icon-search" />
          搜索 “{{ keyword }}” 的结果（共 {{ total }} 篇）
        </div>

        <div v-loading="loading">
          <article-card
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>

        <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />

        <div class="pager-wrap" v-if="total > pageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page.sync="currentPage"
            @current-change="fetchArticles"
          />
        </div>
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
    },
    configMap () {
      return this.$store.getters.configMap || {}
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

        this.articles = Array.isArray(res && res.records) ? res.records : []
        this.total = Number((res && res.total) || 0)
      } catch (e) {
        this.articles = []
        this.total = 0
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-home {
  max-width: 1120px;
  margin: 24px auto 0;
  padding: 0 18px;
}

.page-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
}

.home-top {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  padding: 16px 18px;
  margin-bottom: 14px;

  h1 {
    margin: 0;
    color: var(--blog-brand-dark);
    font-size: 22px;
  }

  p {
    margin: 8px 0 0;
    color: #6f747b;
    font-size: 14px;
  }
}

.search-hint {
  margin-bottom: 14px;
  background: #ecfffd;
  border: 1px solid #b5f0eb;
  color: #138d86;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pager-wrap {
  margin-top: 22px;
  display: flex;
  justify-content: center;
}

@media (max-width: 980px) {
  .page-inner {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}
</style>
