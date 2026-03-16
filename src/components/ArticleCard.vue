<template>
  <article class="article-card">
    <div class="card-grid">
      <div class="card-main">
        <h2 class="card-title">
          <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
        </h2>

        <p class="card-excerpt">{{ excerpt(article.summary || article.content, 160) }}</p>

        <div class="card-meta">
          <span class="meta-item author">
            <img :src="article.authorAvatar || defaultAvatar" alt="author">
            <em>{{ article.authorName || '博主' }}</em>
          </span>
          <span class="meta-item"><i class="el-icon-date" /> {{ formatDate(article.createTime) }}</span>
          <span class="meta-item"><i class="el-icon-view" /> {{ article.viewCount || 0 }}</span>
        </div>

        <div class="card-bottom">
          <button
            v-if="articleCategoryId"
            type="button"
            class="meta-tag category"
            @click="$router.push(`/category/${articleCategoryId}`)"
          >{{ articleCategoryName || '未分类' }}</button>
          <span v-if="articleTagList.length" class="tag-list">
            <button
              v-for="tag in articleTagList.slice(0, 3)"
              :key="tag.id"
              type="button"
              class="meta-tag"
              @click="$router.push(`/tag/${tag.id}`)"
            >{{ tag.name || tag.tagName || '标签' }}</button>
          </span>
        </div>
      </div>

      <router-link class="cover-wrap" :to="`/article/${article.id}`">
        <img v-if="article.coverImage" :src="article.coverImage" :alt="article.title">
        <div v-else class="cover-placeholder">NO IMAGE</div>
      </router-link>
    </div>
  </article>
</template>

<script>
import { formatDate, excerpt } from '@/utils/format'

export default {
  name: 'ArticleCard',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea0722f.png'
    }
  },
  computed: {
    articleCategoryId () {
      return this.article.categoryId || (this.article.category && this.article.category.id) || null
    },
    articleCategoryName () {
      return this.article.categoryName || (this.article.category && this.article.category.name) || ''
    },
    articleTagList () {
      if (Array.isArray(this.article.tagList)) {
        return this.article.tagList
      }
      if (Array.isArray(this.article.tags)) {
        return this.article.tags
      }
      return []
    }
  },
  methods: {
    formatDate,
    excerpt
  }
}
</script>

<style lang="scss" scoped>
.article-card {
  background: var(--blog-card);
  border: 1px solid var(--blog-border);
  border-top: 4px solid rgba(0, 181, 173, 0.7);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  padding: 18px;
  margin-bottom: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 18px;
  align-items: center;
}

.card-title {
  margin: 0;

  a {
    text-decoration: none;
    color: #252525;
    font-size: 24px;
    line-height: 1.28;

    &:hover {
      color: var(--blog-brand-dark);
    }
  }
}

.card-excerpt {
  margin: 12px 0 14px;
  color: #5f6368;
  line-height: 1.85;
  font-size: 14px;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: #7d8087;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &.author img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  em {
    font-style: normal;
  }
}

.card-bottom {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  border: 1px solid #d9ecff;
  background: #f4f9ff;
  color: #4a6c8c;
  border-radius: 16px;
  font-size: 12px;
  padding: 0 10px;
  line-height: 24px;
  cursor: pointer;

  &.category {
    border-color: #99e5df;
    background: #ecfffd;
    color: #0f9b93;
  }
}

.cover-wrap {
  display: block;
  width: 100%;
  height: 138px;
  border-radius: 6px;
  overflow: hidden;
  text-decoration: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  &:hover img {
    transform: scale(1.04);
  }
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #5c6b73, #8999a0);
}

@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .cover-wrap {
    height: 190px;
  }

  .card-title a {
    font-size: 22px;
  }
}

@media (max-width: 640px) {
  .article-card {
    padding: 14px;
  }

  .cover-wrap {
    height: 170px;
  }

  .card-title a {
    font-size: 19px;
  }
}
</style>
