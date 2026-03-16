<template>
  <aside class="sidebar">
    <section class="side-card author-card">
      <img class="author-avatar" :src="configMap.site_avatar || defaultAvatar" alt="avatar">
      <h3 class="author-name">{{ configMap.site_author || '博主' }}</h3>
      <p class="author-desc">{{ configMap.site_description || '记录日常学习与技术沉淀' }}</p>
    </section>

    <section v-if="configMap.site_notice" class="side-card">
      <h4 class="card-title"><i class="el-icon-bell" /> 公告</h4>
      <p class="notice-text">{{ configMap.site_notice }}</p>
    </section>

    <section class="side-card">
      <h4 class="card-title"><i class="el-icon-folder" /> 分类</h4>
      <ul class="count-list">
        <li @click="$router.push('/category/-1')">
          <span>全部分类</span>
          <em>{{ allCategoryCount }}</em>
        </li>
        <li v-for="cat in categories" :key="cat.id" @click="$router.push(`/category/${cat.id}`)">
          <span>{{ cat.name }}</span>
          <em>{{ toCount(cat.articleCount) }}</em>
        </li>
      </ul>
    </section>

    <section class="side-card">
      <h4 class="card-title"><i class="el-icon-price-tag" /> 标签</h4>
      <div class="tag-cloud">
        <button
          type="button"
          class="tag-item"
          @click="$router.push('/tag/-1')"
        >全部<span>{{ allTagCount }}</span></button>
        <button
          v-for="tag in tags"
          :key="tag.id"
          type="button"
          class="tag-item"
          @click="$router.push(`/tag/${tag.id}`)"
        >{{ tag.name }}<span>{{ toCount(tag.articleCount) }}</span></button>
      </div>
    </section>

    <section class="side-card" v-loading="recommendLoading">
      <h4 class="card-title"><i class="el-icon-star-on" /> 最新推荐</h4>
      <ul class="recommend-list" v-if="recommendList.length">
        <li v-for="item in recommendList" :key="item.id" @click="$router.push(`/article/${item.id}`)">
          <img v-if="item.coverImage" :src="item.coverImage" :alt="item.title">
          <div class="recommend-content">
            <p class="recommend-title">{{ item.title }}</p>
            <span>{{ formatDate(item.createTime) }}</span>
          </div>
        </li>
      </ul>
      <p class="empty-text" v-else>暂无推荐文章</p>
    </section>
  </aside>
</template>

<script>
import { getArticles } from '@/api/blog'
import { formatDate } from '@/utils/format'

export default {
  name: 'AppSidebar',
  data () {
    return {
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea0722f.png',
      recommendList: [],
      recommendLoading: false
    }
  },
  computed: {
    configMap () {
      return this.$store.getters.configMap || {}
    },
    categories () {
      return this.$store.getters.categories || []
    },
    tags () {
      return this.$store.getters.tags || []
    },
    allCategoryCount () {
      return this.categories.reduce((sum, item) => sum + this.toCount(item.articleCount), 0)
    },
    allTagCount () {
      return this.tags.reduce((sum, item) => sum + this.toCount(item.articleCount), 0)
    }
  },
  created () {
    this.fetchRecommendList()
  },
  methods: {
    formatDate,
    toCount (value) {
      const count = Number(value)
      return Number.isFinite(count) && count > 0 ? count : 0
    },
    async fetchRecommendList () {
      this.recommendLoading = true
      try {
        const res = await getArticles({ pageNum: 1, pageSize: 6 })
        this.recommendList = Array.isArray(res && res.records) ? res.records : []
      } catch (e) {
        this.recommendList = []
      } finally {
        this.recommendLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  background: var(--blog-card);
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  padding: 14px;
}

.author-card {
  text-align: center;
}

.author-avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 181, 173, 0.25);
}

.author-name {
  margin: 10px 0 6px;
  font-size: 16px;
  color: #222;
}

.author-desc {
  margin: 0;
  font-size: 13px;
  color: var(--blog-muted);
  line-height: 1.6;
}

.card-title {
  margin: 0 0 10px;
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notice-text {
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.count-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 2px;
    border-bottom: 1px dashed #ececec;
    cursor: pointer;
    font-size: 13px;
    color: #4a4a4a;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      color: var(--blog-brand-dark);
    }

    em {
      min-width: 26px;
      text-align: center;
      font-style: normal;
      font-size: 12px;
      border-radius: 10px;
      padding: 0 6px;
      background: #f3f4f6;
      color: #666;
      line-height: 20px;
    }
  }
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #555;
  border-radius: 16px;
  font-size: 12px;
  line-height: 24px;
  padding: 0 10px;
  cursor: pointer;

  span {
    margin-left: 6px;
    color: #909399;
  }

  &:hover {
    color: var(--blog-brand-dark);
    border-color: rgba(0, 181, 173, 0.4);
  }
}

.recommend-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed #ececec;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    img {
      width: 64px;
      height: 44px;
      border-radius: 4px;
      object-fit: cover;
      flex-shrink: 0;
    }
  }
}

.recommend-content {
  min-width: 0;
}

.recommend-title {
  margin: 0;
  color: #444;
  font-size: 13px;
  line-height: 1.45;
  word-break: break-word;
}

.recommend-content span {
  color: #a0a3aa;
  font-size: 12px;
}

.empty-text {
  color: #9da1a8;
  font-size: 12px;
  margin: 0;
}
</style>
