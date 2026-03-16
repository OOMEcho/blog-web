<template>
  <div class="page-detail">
    <div class="page-inner">
      <main class="main-content">
        <el-card v-loading="loading" class="article-main" shadow="never">
          <template v-if="article">
            <div class="cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </div>

            <h1 class="article-title">{{ article.title }}</h1>

            <div class="article-meta">
              <span class="meta-item">
                <i class="el-icon-user" /> {{ article.authorName || article.author || '博主' }}
              </span>
              <span class="meta-item">
                <i class="el-icon-time" /> {{ formatDate(article.createTime) }}
              </span>
              <span class="meta-item" v-if="article.categoryName">
                <i class="el-icon-folder-opened" />
                <router-link v-if="article.categoryId" :to="`/category/${article.categoryId}`">{{ article.categoryName }}</router-link>
                <span v-else>{{ article.categoryName }}</span>
              </span>
              <span class="meta-item">
                <i class="el-icon-view" /> {{ article.viewCount || 0 }} 次阅读
              </span>
            </div>

            <div class="article-tags" v-if="articleTagList.length">
              <el-tag
                v-for="tag in articleTagList"
                :key="tag.id"
                size="small"
                type="info"
                @click.native="$router.push(`/tag/${tag.id}`)"
                style="cursor:pointer;margin-right:8px"
              >{{ tag.name }}</el-tag>
            </div>

            <div class="article-body">
              <mavon-editor
                :value="article.content || ''"
                :subfield="false"
                :default-open="'preview'"
                :toolbars-flag="false"
                :editable="false"
                :scroll-style="true"
                :box-shadow="false"
              />
            </div>
          </template>
          <el-empty v-else-if="!loading" description="文章不存在" />
        </el-card>
      </main>
      <app-sidebar class="sidebar" />
    </div>
  </div>
</template>

<script>
import AppSidebar from '../components/AppSidebar.vue'
import { getArticleDetail } from '@/api/blog'
import { formatDate } from '@/utils/format'

export default {
  name: 'ArticleDetail',
  components: {
    AppSidebar
  },
  data () {
    return {
      article: null,
      loading: false
    }
  },
  computed: {
    articleTagList () {
      if (!this.article) {
        return []
      }
      if (Array.isArray(this.article.tagList)) {
        return this.article.tagList
      }
      if (Array.isArray(this.article.tags)) {
        return this.article.tags
      }
      return []
    }
  },
  watch: {
    '$route.params.id' () {
      this.fetchDetail()
    }
  },
  created () {
    this.fetchDetail()
  },
  methods: {
    formatDate,
    async fetchDetail () {
      this.loading = true
      try {
        const res = await getArticleDetail(this.$route.params.id)
        this.article = res || null
      } catch (e) {
        this.article = null
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-detail {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px;
}

.page-inner {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

.article-main {
  border-radius: 8px;

  .cover {
    margin: -20px -20px 24px;
    max-height: 400px;
    overflow: hidden;

    img {
      width: 100%;
      object-fit: cover;
    }
  }

  .article-title {
    font-size: 26px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 16px;
    line-height: 1.4;
  }

  .article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 13px;
    color: #909399;
    margin-bottom: 16px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;

      a {
        color: #909399;
        text-decoration: none;

        &:hover {
          color: #409EFF;
        }
      }
    }
  }

  .article-tags {
    margin-bottom: 24px;
  }

  .article-body {
    border-top: 1px solid #f0f0f0;
    padding-top: 24px;

    :deep(.v-note-wrapper) {
      border: none !important;
      box-shadow: none !important;
      min-height: unset !important;
    }

    :deep(.v-note-show) {
      padding: 0 !important;
    }
  }
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
