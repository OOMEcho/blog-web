<template>
  <div class="page-links">
    <section class="link-panel" v-loading="linkLoading">
      <div class="link-header">
        <h2><i class="el-icon-link" /> 欢迎互访交流，申请友链请在关于我页面联系我 ~</h2>
      </div>

      <div v-if="normalizedLinks.length" class="link-grid">
        <a
          v-for="link in normalizedLinks"
          :key="link.id || link.name"
          :href="link.safeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="link-item"
        >
          <img :src="resolveLinkLogo(link.logo)" :alt="link.name" @error="onLinkLogoError">
          <div class="link-info">
            <p>{{ link.name }}</p>
            <span>{{ link.description || '欢迎互访交流' }}</span>
          </div>
        </a>
      </div>
      <div v-else-if="!linkLoading" class="empty-block">
        <p>暂无友情链接</p>
      </div>
    </section>
  </div>
</template>

<script>
import { getLinks } from '@/api/blog'

export default {
  name: 'LinkList',
  data () {
    return {
      defaultAvatar: '/images/default-avatar.png',
      links: [],
      linkLoading: false
    }
  },
  computed: {
    normalizedLinks () {
      return this.links
        .map(link => ({
          ...link,
          safeUrl: this.safeHttpUrl(link.url)
        }))
        .filter(link => !!link.safeUrl)
    }
  },
  created () {
    this.fetchLinks()
  },
  methods: {
    resolveLinkLogo (logo) {
      const value = (logo || '').trim()
      return value || this.defaultAvatar
    },
    onLinkLogoError (event) {
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
    async fetchLinks () {
      this.linkLoading = true
      try {
        const data = await getLinks()
        this.links = Array.isArray(data) ? data : []
      } catch (e) {
        this.links = []
      } finally {
        this.linkLoading = false
      }
    },
    safeHttpUrl (value) {
      const raw = (value || '').trim()
      if (!raw) {
        return ''
      }
      if (/^https?:\/\//i.test(raw)) {
        return raw
      }
      if (/^[a-zA-Z]+:/i.test(raw)) {
        return ''
      }
      return `https://${raw}`
    }
  }
}
</script>

<style lang="scss" scoped>
.page-links {
  width: 100%;
  max-width: var(--content-width);
  margin: 24px auto 0;
  padding: 0 18px;
}

.link-panel {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  padding: 30px;

  .link-header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      margin: 0 0 12px;
      font-size: 26px;
      color: var(--blog-brand-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    p {
      color: #8c929b;
      font-size: 14px;
    }
  }
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  border: 1px solid #e9edf0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--blog-brand-dark);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  img {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid #f0f2f5;
  }
}

.link-info {
  min-width: 0;

  p {
    margin: 0;
    color: #2f3237;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    display: block;
    margin-top: 4px;
    color: #8c929b;
    font-size: 13px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.empty-block {
  text-align: center;
  padding: 40px 0;
  color: #9197a1;
}
</style>
