<template>
  <div class="page-archive">
    <div class="archive-shell">
      <section class="archive-head">
        <h1><i class="el-icon-collection" /> 归档</h1>
        <p>共 <span>{{ articles.length }}</span> 篇文章</p>
      </section>

      <section class="archive-body" v-loading="loading">
        <div
          v-for="(group, year) in groupedArticles"
          :key="year"
          class="year-block"
        >
          <h2>{{ year }}</h2>
          <ul>
            <li
              v-for="article in group"
              :key="article.id"
              @click="$router.push(`/article/${article.id}`)"
            >
              <div class="item-main">
                <i class="dot" />
                <span class="title">{{ article.title }}</span>
                <span class="date">{{ formatDate(article.createTime, 'MM-DD') }}</span>
              </div>
              <span class="origin">原创</span>
            </li>
          </ul>
        </div>
      </section>

      <el-empty v-if="!loading && articles.length === 0" description="暂无归档文章" />
    </div>
  </div>
</template>

<script>
import { getArchives } from '@/api/blog'
import { formatDate } from '@/utils/format'

export default {
  name: 'ArchiveView',
  data () {
    return {
      articles: [],
      loading: false
    }
  },
  computed: {
    groupedArticles () {
      const groups = {}
      this.articles.forEach(article => {
        const year = new Date(article.createTime).getFullYear()
        if (!groups[year]) {
          groups[year] = []
        }
        groups[year].push(article)
      })

      return Object.keys(groups)
        .sort((a, b) => Number(b) - Number(a))
        .reduce((acc, year) => {
          acc[year] = groups[year]
          return acc
        }, {})
    }
  },
  created () {
    this.fetchArchives()
  },
  methods: {
    formatDate,
    async fetchArchives () {
      this.loading = true
      try {
        const res = await getArchives()
        this.articles = Array.isArray(res) ? res : []
      } catch (e) {
        this.articles = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-archive {
  max-width: 980px;
  margin: 24px auto 0;
  padding: 0 18px;
}

.archive-head,
.archive-body {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
}

.archive-head {
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

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }

  span {
    color: #ff8a00;
    font-weight: 700;
  }
}

.archive-body {
  margin-top: 12px;
  padding: 16px;
}

.year-block {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  h2 {
    margin: 0 0 10px;
    color: #2f3237;
    font-size: 24px;
    text-align: center;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid #eef0f2;
    border-radius: 6px;
    overflow: hidden;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid #f2f3f5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f9fbfc;

      .title {
        color: var(--blog-brand-dark);
      }
    }
  }
}

.item-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--blog-brand);
  flex-shrink: 0;
}

.title {
  color: #333;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  color: #a0a4ab;
  font-size: 12px;
}

.origin {
  color: #ff8a00;
  border: 1px solid #ffd4a3;
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 8px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .archive-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .year-block h2 {
    text-align: left;
    font-size: 20px;
  }

  .title {
    max-width: 160px;
  }
}
</style>
