<template>
  <div class="page-tag">
    <div class="page-inner">
      <main class="main-content">
        <section class="head-segment">
          <div>
            <h1><i class="el-icon-price-tag" /> 标签</h1>
          </div>
          <div class="head-count">共 {{ tags.length }} 个标签</div>
        </section>

        <section class="filter-segment">
          <button
            type="button"
            class="tag-btn"
            :class="{ active: isAll }"
            @click="switchTag('-1')"
          >全部<span>{{ allCount }}</span></button>

          <button
            v-for="tag in tags"
            :key="tag.id"
            type="button"
            class="tag-btn"
            :class="{ active: String(tag.id) === String(tagId) }"
            :style="tagStyle(tag, String(tag.id) === String(tagId))"
            @click="switchTag(tag.id)"
          >{{ tag.name }}<span>{{ toCount(tag.articleCount) }}</span></button>
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
          <el-empty v-if="!loading && articles.length === 0" description="该标签下暂无文章" />

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
    </div>
  </div>
</template>

<script>
import ArticleCard from '../components/ArticleCard.vue'
import { getArticles } from '@/api/blog'
import { buildTagStyle } from '@/utils/color'

export default {
  name: 'TagList',
  components: { ArticleCard },
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
    tags () {
      return this.$store.getters.tags || []
    },
    isAll () {
      return String(this.tagId) === '-1'
    },
    currentTitle () {
      if (this.isAll) {
        return '全部标签文章'
      }
      const tag = this.tags.find(item => String(item.id) === String(this.tagId))
      return tag ? `${tag.name} 标签文章` : '标签文章'
    },
    allCount () {
      return this.tags.reduce((sum, item) => sum + this.toCount(item.articleCount), 0)
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
    tagStyle (tag, active) {
      return buildTagStyle(tag && tag.color, active)
    },
    toCount (value) {
      const count = Number(value)
      return Number.isFinite(count) && count > 0 ? count : 0
    },
    switchTag (id) {
      this.$router.push(`/tag/${id}`)
    },
    async fetchArticles () {
      this.loading = true
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize
        }

        if (!this.isAll) {
          params.tagId = this.tagId
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
.page-tag {
  width: 100%;
  max-width: 60em;
  margin: 24px auto 0;
  padding: 0 18px;
}

.page-inner {
  display: block;
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
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    margin: 0;
    color: var(--blog-brand-dark);
    font-size: 20px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
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

.tag-btn {
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 16px;
  padding: 0 10px;
  line-height: 30px;
  font-size: 13px;
  color: #555;
  cursor: pointer;

  span {
    margin-left: 6px;
    color: inherit;
    opacity: 0.92;
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

@media (max-width: 640px) {
  .head-segment {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
