<template>
  <div class="page-detail">
    <div class="detail-shell" v-loading="loading">
      <template v-if="article">
        <section class="detail-head">
          <div class="head-item author">
            <img :src="resolveAuthorAvatar(article.authorAvatar)" alt="author" @error="onAvatarError">
            <router-link to="/about">{{ article.authorName || '博主' }}</router-link>
          </div>
          <div class="head-item"><i class="el-icon-date" /> {{ formatDate(article.createTime) }}</div>
          <div class="head-item"><i class="el-icon-view" /> {{ article.viewCount || 0 }}</div>
        </section>

        <section class="detail-cover" v-if="article.coverImage">
          <img :src="article.coverImage" :alt="article.title">
        </section>

        <section class="detail-body">
          <div class="origin-tag">原创</div>
          <h1>{{ article.title }}</h1>

          <div class="article-content">
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

          <div class="tag-wrap" v-if="articleTagList.length">
            <button
              v-for="tag in articleTagList"
              :key="tag.id"
              type="button"
              @click="$router.push(`/tag/${tag.id}`)"
            >{{ tag.name }}</button>
          </div>
        </section>

        <section class="detail-info">
          <div>
            <p>作者：{{ article.authorName || '博主' }}</p>
            <p>发表时间：{{ formatDate(article.createTime, 'YYYY-MM-DD') }}</p>
            <p v-if="article.categoryName">
              分类：
              <router-link v-if="article.categoryId" :to="`/category/${article.categoryId}`">{{ article.categoryName }}</router-link>
              <span v-else>{{ article.categoryName }}</span>
            </p>
            <p>版权声明：转载请注明出处</p>
          </div>
        </section>
      </template>

      <el-empty v-else-if="!loading" description="文章不存在" />
    </div>
  </div>
</template>

<script>
import { getArticleDetail } from '@/api/blog'
import { formatDate } from '@/utils/format'

export default {
  name: 'ArticleDetail',
  data () {
    return {
      article: null,
      loading: false,
      defaultAvatar: '/images/default-avatar.png'
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
    resolveAuthorAvatar (avatar) {
      const value = (avatar || '').trim()
      return value || this.defaultAvatar
    },
    onAvatarError (event) {
      const img = event && event.target
      if (!img) {
        return
      }
      if (img.dataset.fallbackApplied === '1') {
        return
      }
      img.dataset.fallbackApplied = '1'
      img.src = this.defaultAvatar
    },
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
  max-width: 980px;
  margin: 24px auto 0;
  padding: 0 18px;
}

.detail-head,
.detail-cover,
.detail-body,
.detail-info {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 14px;
}

.head-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6f747c;
  font-size: 13px;

  &.author img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  a {
    color: #4f5a62;
    text-decoration: none;
  }
}

.detail-cover {
  margin-top: 10px;
  overflow: hidden;

  img {
    width: 100%;
    display: block;
    object-fit: cover;
    max-height: 420px;
  }
}

.detail-body {
  margin-top: 10px;
  padding: 18px;
}

.origin-tag {
  margin-left: auto;
  width: fit-content;
  color: #ff8a00;
  border: 1px solid #ffd4a3;
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 8px;
}

.detail-body h1 {
  margin: 14px 0 18px;
  text-align: center;
  font-size: 28px;
  color: #222;
}

.article-content :deep(.v-note-wrapper) {
  border: none !important;
  box-shadow: none !important;
  min-height: unset !important;
}

.article-content :deep(.v-note-show) {
  padding: 0 !important;
}

.tag-wrap {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    border: 1px solid #d8f5f2;
    background: #effcfb;
    color: #0e8f87;
    border-radius: 16px;
    padding: 0 10px;
    line-height: 26px;
    font-size: 12px;
    cursor: pointer;
  }
}

.detail-info {
  margin-top: 10px;
  border-left: 4px solid #8be0d8;
  padding: 12px 14px;

  p {
    margin: 0 0 6px;
    font-size: 14px;
    color: #51575f;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: var(--blog-brand-dark);
    text-decoration: none;
  }
}

@media (max-width: 640px) {
  .detail-head {
    flex-wrap: wrap;
    gap: 10px;
  }

  .detail-body h1 {
    font-size: 22px;
  }
}
</style>
