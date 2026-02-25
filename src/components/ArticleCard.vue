<template>
  <el-card class="article-card" shadow="hover" @click.native="goDetail">
    <div class="card-cover" v-if="article.coverImage">
      <img :src="article.coverImage" :alt="article.title" />
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="meta-item">
          <i class="el-icon-folder-opened" />
          <router-link
            v-if="article.category"
            :to="`/category/${article.category.id}`"
            @click.native.stop
          >{{ article.category.name }}</router-link>
        </span>
        <span class="meta-item">
          <i class="el-icon-time" />
          {{ formatDate(article.createTime) }}
        </span>
        <span class="meta-item">
          <i class="el-icon-view" />
          {{ article.viewCount || 0 }}
        </span>
      </div>
      <h2 class="card-title">{{ article.title }}</h2>
      <p class="card-excerpt">{{ excerpt(article.summary || article.content) }}</p>
      <div class="card-tags" v-if="article.tags && article.tags.length">
        <el-tag
          v-for="tag in article.tags"
          :key="tag.id"
          size="mini"
          type="info"
          @click.native.stop="$router.push(`/tag/${tag.id}`)"
          style="cursor:pointer;margin-right:6px;"
        >{{ tag.name }}</el-tag>
      </div>
    </div>
  </el-card>
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
  methods: {
    formatDate,
    excerpt,
    goDetail () {
      this.$router.push(`/article/${this.article.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.article-card {
  cursor: pointer;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform .2s, box-shadow .2s;

  &:hover {
    transform: translateY(-3px);
  }

  .card-cover {
    margin: -20px -20px 16px;
    height: 200px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform .3s;
    }
    &:hover img {
      transform: scale(1.03);
    }
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    color: #909399;
    margin-bottom: 10px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      i { font-size: 13px; }
      a {
        color: #909399;
        text-decoration: none;
        &:hover { color: #409EFF; }
      }
    }
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 10px;
    line-height: 1.4;
    &:hover { color: #409EFF; }
  }

  .card-excerpt {
    font-size: 14px;
    color: #606266;
    line-height: 1.7;
    margin: 0 0 12px;
  }
}
</style>
