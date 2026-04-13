<template>
  <aside class="sidebar">
    <section v-if="configMap.site_notice" class="side-card">
      <h4 class="card-title"><i class="el-icon-bell" /> 公告</h4>
      <p class="notice-text">{{ configMap.site_notice }}</p>
    </section>

    <section class="side-card">
      <div class="card-head">
        <h4 class="card-title"><i class="el-icon-folder" /> 分类</h4>
        <router-link class="more-link" to="/category/-1" aria-label="查看全部分类">
          更多 <span class="arrow">&gt;&gt;</span>
        </router-link>
      </div>
      <ul class="count-list">
        <li @click="$router.push('/category/-1')">
          <span>全部分类</span>
          <em>{{ allCategoryCount }}</em>
        </li>
        <li v-for="cat in displayCategories" :key="cat.id" @click="$router.push(`/category/${cat.id}`)">
          <span>{{ cat.name }}</span>
          <em>{{ toCount(cat.articleCount) }}</em>
        </li>
      </ul>
    </section>

    <section class="side-card">
      <div class="card-head">
        <h4 class="card-title"><i class="el-icon-price-tag" /> 标签</h4>
        <router-link class="more-link" to="/tag/-1" aria-label="查看全部标签">
          更多 <span class="arrow">&gt;&gt;</span>
        </router-link>
      </div>
      <div class="tag-cloud">
        <button
          type="button"
          class="tag-item"
          @click="$router.push('/tag/-1')"
        >全部<span>{{ allTagCount }}</span></button>
        <button
          v-for="tag in displayTags"
          :key="tag.id"
          type="button"
          class="tag-item"
          :style="tagStyle(tag)"
          @click="$router.push(`/tag/${tag.id}`)"
        >{{ tag.name }}<span>{{ toCount(tag.articleCount) }}</span></button>
      </div>
    </section>

    <section class="side-card" v-loading="recommendLoading">
      <h4 class="card-title"><i class="el-icon-star-on" /> 最新推荐</h4>
      <ul class="recommend-list" v-if="recommendList.length">
        <li v-for="item in recommendList" :key="item.id" @click="$router.push(`/article/${item.id}`)">
          <img v-if="item.coverImage" :src="item.coverImage" :alt="item.title" width="64" height="44" loading="lazy" decoding="async">
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
import { buildTagStyle } from '@/utils/color'

export default {
  name: 'AppSidebar',
  data () {
    return {
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
    displayCategories () {
      return this.sortByCount(this.categories).slice(0, 8)
    },
    displayTags () {
      return this.sortByCount(this.tags).slice(0, 8)
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
    tagStyle (tag) {
      return buildTagStyle(tag && tag.color)
    },
    toCount (value) {
      const count = Number(value)
      return Number.isFinite(count) && count > 0 ? count : 0
    },
    sortByCount (list) {
      return [...list].sort((a, b) => {
        const countDiff = this.toCount(b.articleCount) - this.toCount(a.articleCount)
        if (countDiff !== 0) {
          return countDiff
        }
        return Number(a.id || 0) - Number(b.id || 0)
      })
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

.card-title {
  margin: 0;
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.more-link {
  text-decoration: none;
  color: #9aa0a8;
  font-size: 12px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .arrow {
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--blog-brand-dark);

    .arrow {
      transform: translateX(2px);
    }
  }
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
    color: inherit;
    opacity: 0.92;
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
