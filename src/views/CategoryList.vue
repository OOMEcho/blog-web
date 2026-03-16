<template>
  <div class="page-category">
    <div class="page-inner">
      <main class="main-content">
        <section class="head-segment">
          <div>
            <h1>分类</h1>
            <p>按分类筛选文章</p>
          </div>
          <div class="head-count">共 {{ categories.length }} 个分类</div>
        </section>

        <section class="filter-segment">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: isAll }"
            @click="switchCategory('-1')"
          >全部 <span>{{ allCount }}</span></button>

          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="filter-btn"
            :class="{ active: String(cat.id) === String(categoryId) }"
            @click="switchCategory(cat.id)"
          >{{ cat.name }} <span>{{ toCount(cat.articleCount) }}</span></button>
        </section>

        <section class="list-segment">
          <div class="list-title">
            <h2>{{ currentTitle }}</h2>
            <span>{{ total }} 篇</span>
          </div>

          <div v-loading="loading">
            <article-card
              v-for="article in articles"
              :key="article.id"
              :article="article"
            />
          </div>
          <el-empty v-if="!loading && articles.length === 0" description="该分类下暂无文章" />

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
        </section>
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
  name: 'CategoryList',
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
    categoryId () {
      return this.$route.params.id
    },
    categories () {
      return this.$store.getters.categories || []
    },
    isAll () {
      return String(this.categoryId) === '-1'
    },
    currentTitle () {
      if (this.isAll) {
        return '全部分类文章'
      }
      const cat = this.categories.find(item => String(item.id) === String(this.categoryId))
      return cat ? `${cat.name} 分类文章` : '分类文章'
    },
    allCount () {
      return this.categories.reduce((sum, item) => sum + this.toCount(item.articleCount), 0)
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
    toCount (value) {
      const count = Number(value)
      return Number.isFinite(count) && count > 0 ? count : 0
    },
    switchCategory (id) {
      this.$router.push(`/category/${id}`)
    },
    async fetchArticles () {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }

        if (!this.isAll) {
          params.categoryId = this.categoryId
        }

        const res = await getArticles(params)
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
.page-category {
  max-width: 1120px;
  margin: 24px auto 0;
  padding: 0 18px;
}

.page-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
}

.head-segment,
.filter-segment,
.list-segment {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
}

.head-segment {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    margin: 0;
    color: var(--blog-brand-dark);
    font-size: 24px;
  }

  p {
    margin: 6px 0 0;
    color: #81858d;
    font-size: 13px;
  }
}

.head-count {
  font-size: 14px;
  color: #ff8a00;
  font-weight: 600;
}

.filter-segment {
  margin-top: 12px;
  padding: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 20px;
  padding: 0 12px;
  line-height: 30px;
  font-size: 13px;
  color: #555;
  cursor: pointer;

  span {
    margin-left: 6px;
    color: #999;
  }

  &.active {
    border-color: rgba(0, 181, 173, 0.6);
    color: var(--blog-brand-dark);
    background: #effcfb;
  }
}

.list-segment {
  margin-top: 12px;
  padding: 14px;
}

.list-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    font-size: 18px;
    color: #2f3237;
  }

  span {
    font-size: 13px;
    color: #8a8f97;
  }
}

.pager-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 980px) {
  .page-inner {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}

@media (max-width: 640px) {
  .head-segment {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
