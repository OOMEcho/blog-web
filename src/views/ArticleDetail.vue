<template>
  <div class="page-detail">
    <div class="detail-shell" v-loading="loading">
      <template v-if="article">
        <div class="detail-layout">
          <aside class="toc-panel">
            <div class="toc-head">
              <i class="el-icon-notebook-2" />
              <span>文档目录</span>
            </div>

            <ul v-if="tocList.length" class="toc-list">
              <li
                v-for="item in tocList"
                :key="item.id"
                class="toc-item"
                :class="{ active: item.id === activeHeadingId }"
              >
                <button
                  type="button"
                  :title="item.text"
                  :style="{ paddingLeft: `${(item.level - tocBaseLevel) * 14 + 12}px` }"
                  @click="scrollToHeading(item.id)"
                >
                  {{ item.text }}
                </button>
              </li>
            </ul>

            <p v-else class="toc-empty">正文没有可导航标题</p>
          </aside>

          <main class="detail-main">
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

              <div ref="articleContent" class="article-content">
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
          </main>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="文章不存在" />
    </div>

    <el-backtop :visibility-height="260" :right="34" :bottom="92">
      <div class="backtop-btn">
        <i class="el-icon-caret-top" />
      </div>
    </el-backtop>
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
      defaultAvatar: '/images/default-avatar.png',
      tocList: [],
      activeHeadingId: '',
      headingObserver: null
    }
  },
  computed: {
    tocBaseLevel () {
      if (!this.tocList.length) {
        return 1
      }
      return this.tocList.reduce((min, item) => Math.min(min, item.level), 6)
    },
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
  beforeDestroy () {
    this.cleanupHeadingObserver()
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
    getHeadingLevel (tagName) {
      const match = String(tagName || '').toUpperCase().match(/^H([1-6])$/)
      if (!match) {
        return 6
      }
      return Number(match[1])
    },
    cleanupHeadingObserver () {
      if (this.headingObserver) {
        this.headingObserver.disconnect()
        this.headingObserver = null
      }
    },
    updateActiveHeadingByScroll () {
      if (!this.tocList.length) {
        this.activeHeadingId = ''
        return
      }

      const offsetTop = 108
      let activeId = this.tocList[0].id

      for (let i = 0; i < this.tocList.length; i++) {
        const item = this.tocList[i]
        const node = document.getElementById(item.id)
        if (!node) {
          continue
        }
        if (node.getBoundingClientRect().top <= offsetTop) {
          activeId = item.id
        } else {
          break
        }
      }

      this.activeHeadingId = activeId
    },
    setupHeadingObserver () {
      if (typeof window === 'undefined' || !window.IntersectionObserver) {
        this.updateActiveHeadingByScroll()
        return
      }

      const headingNodes = this.tocList
        .map(item => document.getElementById(item.id))
        .filter(Boolean)

      if (!headingNodes.length) {
        return
      }

      this.cleanupHeadingObserver()
      this.headingObserver = new window.IntersectionObserver(entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length) {
          this.activeHeadingId = visible[0].target.id
          return
        }

        this.updateActiveHeadingByScroll()
      }, {
        root: null,
        rootMargin: '-90px 0px -68% 0px',
        threshold: [0, 1]
      })

      headingNodes.forEach(node => {
        this.headingObserver.observe(node)
      })
    },
    buildToc () {
      this.cleanupHeadingObserver()
      this.tocList = []
      this.activeHeadingId = ''

      const container = this.$refs.articleContent
      if (!container) {
        return
      }

      const selectors = [
        '.v-note-show .v-show-content h1, .v-note-show .v-show-content h2, .v-note-show .v-show-content h3, .v-note-show .v-show-content h4',
        '.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4',
        'h1, h2, h3, h4'
      ]

      let headingNodes = []
      for (let i = 0; i < selectors.length; i++) {
        headingNodes = Array.from(container.querySelectorAll(selectors[i]))
          .filter(node => (node.textContent || '').trim())
        if (headingNodes.length) {
          break
        }
      }

      if (!headingNodes.length) {
        return
      }

      const prefix = `article-${this.$route.params.id || 'detail'}-toc`
      this.tocList = headingNodes.map((node, index) => {
        const level = this.getHeadingLevel(node.tagName)
        const id = (node.id || '').trim() || `${prefix}-${index + 1}`
        node.id = id

        return {
          id,
          level,
          text: node.textContent.trim()
        }
      })

      this.$nextTick(() => {
        this.setupHeadingObserver()
        this.updateActiveHeadingByScroll()
      })
    },
    scrollToHeading (id) {
      const node = document.getElementById(id)
      if (!node) {
        return
      }

      const offset = 74
      const top = window.pageYOffset + node.getBoundingClientRect().top - offset
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth'
      })

      this.activeHeadingId = id
    },
    async fetchDetail () {
      this.loading = true
      this.cleanupHeadingObserver()
      this.tocList = []
      this.activeHeadingId = ''

      try {
        const res = await getArticleDetail(this.$route.params.id)
        this.article = res || null

        if (this.article) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.buildToc()
            }, 0)
          })
        }
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
  --detail-main-width: 60em;
  --detail-toc-width: 172px;
  --detail-gap: 12px;
  max-width: calc(var(--detail-main-width) + var(--detail-toc-width) + var(--detail-gap));
  margin: 24px auto 0;
  padding: 0 18px;
}

.detail-layout {
  display: grid;
  grid-template-columns: var(--detail-toc-width) minmax(0, var(--detail-main-width));
  gap: var(--detail-gap);
  align-items: start;
  justify-content: center;
}

.detail-main {
  min-width: 0;
  max-width: var(--detail-main-width);
}

.toc-panel {
  position: sticky;
  top: 74px;
  align-self: start;
  max-height: calc(100vh - 92px);
  overflow: auto;
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  padding: 12px 0;
}

.toc-head {
  margin: 0;
  padding: 0 14px 10px;
  border-bottom: 1px solid #edf0f2;
  color: #2f3237;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.toc-item {
  margin: 0;

  button {
    width: 100%;
    border: none;
    background: transparent;
    color: #565c65;
    text-align: left;
    line-height: 1.45;
    font-size: 13px;
    padding-top: 8px;
    padding-right: 12px;
    padding-bottom: 8px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.2s ease;

    &:hover {
      color: var(--blog-brand-dark);
      background: #f8fbfb;
    }
  }

  &.active button {
    color: var(--blog-brand-dark);
    background: #effcfb;
    font-weight: 600;
    box-shadow: inset 3px 0 0 rgba(0, 181, 173, 0.72);
  }
}

.toc-empty {
  margin: 12px 14px 0;
  color: #8b919a;
  font-size: 13px;
  line-height: 1.7;
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
  z-index: auto !important;
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

.backtop-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--blog-brand);
  color: #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

@media (max-width: 1180px) {
  .page-detail {
    --detail-toc-width: 148px;
    --detail-gap: 10px;
  }
}

@media (max-width: 980px) {
  .page-detail {
    max-width: 60em;
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }

  .toc-panel {
    display: none;
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
