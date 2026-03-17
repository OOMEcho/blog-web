<template>
  <div class="page-about">
    <section class="about-layout">
      <aside class="about-left">
        <img class="avatar" :src="avatarUrl" alt="站点头像" @error="onAvatarError">
      </aside>

      <article class="about-right">
        <h2><i class="el-icon-user" /> 关于我</h2>

        <div class="about-content" v-html="aboutContent" />

        <section class="social-block">
          <h3>社交链接</h3>
          <div v-if="socialLinks.length" class="social-links">
            <a
              v-for="item in socialLinks"
              :key="item.key"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
            >{{ item.label }}</a>
          </div>
          <p v-else class="empty-text">暂无社交链接配置</p>
        </section>
      </article>
    </section>

    <section class="link-panel" v-loading="linkLoading">
      <h3><i class="el-icon-link" /> 友情链接</h3>
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
      <p v-else class="empty-text">暂无友情链接</p>
    </section>
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { getLinks } from '@/api/blog'

export default {
  name: 'AboutView',
  data () {
    return {
      defaultAvatar: '/images/default-avatar.png',
      links: [],
      linkLoading: false
    }
  },
  computed: {
    configMap () {
      return this.$store.getters.configMap || {}
    },
    avatarUrl () {
      return (this.configMap.site_avatar || '').trim() || this.defaultAvatar
    },
    aboutContent () {
      const raw = this.configMap.site_about || '<p>欢迎来到我的博客！</p>'
      return DOMPurify.sanitize(raw)
    },
    socialLinks () {
      const links = []
      const github = this.safeHttpUrl(this.configMap.social_github)
      const gitee = this.safeHttpUrl(this.configMap.social_gitee)
      const email = (this.configMap.social_email || '').trim()
      const qq = (this.configMap.social_qq || '').trim()

      if (github) {
        links.push({ key: 'github', label: 'GitHub', href: github })
      }
      if (gitee) {
        links.push({ key: 'gitee', label: 'Gitee', href: gitee })
      }
      if (email) {
        links.push({ key: 'email', label: email, href: `mailto:${email}` })
      }
      if (qq) {
        links.push({
          key: 'qq',
          label: `QQ ${qq}`,
          href: `https://wpa.qq.com/msgrd?v=3&uin=${qq}&site=qq&menu=yes`
        })
      }

      return links
    },
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
.page-about {
  width: 100%;
  max-width: var(--content-width);
  margin: 24px auto 0;
  padding: 0 18px;
}

.about-layout {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  overflow: hidden;
}

.about-left {
  border-right: 1px solid #edf0f2;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fbfdfd 0%, #f7fafa 100%);
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(0, 181, 173, 0.18);
  background: #f3f4f6;
}

.site-name {
  margin: 14px 0 0;
  color: #2f3237;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.about-right {
  padding: 22px 24px;

  h2 {
    margin: 0 0 14px;
    color: var(--blog-brand-dark);
    font-size: 22px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}

.about-content {
  color: #454c56;
  font-size: 14px;
  line-height: 1.9;
}

.about-content :deep(p) {
  margin: 0 0 10px;
}

.about-content :deep(img) {
  max-width: 100%;
}

.social-block {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed #e9ecef;

  h3 {
    margin: 0 0 10px;
    font-size: 16px;
    color: #2f3237;
  }
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  a {
    text-decoration: none;
    font-size: 13px;
    line-height: 26px;
    padding: 0 12px;
    border-radius: 14px;
    border: 1px solid #dce0e8;
    color: #4f5761;

    &:hover {
      color: var(--blog-brand-dark);
      border-color: rgba(0, 181, 173, 0.4);
      background: rgba(0, 181, 173, 0.06);
    }
  }
}

.empty-text {
  margin: 0;
  font-size: 13px;
  color: #9197a1;
}

.link-panel {
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
  padding: 16px;

  h3 {
    margin: 0 0 12px;
    font-size: 18px;
    color: #2f3237;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  border: 1px solid #e9edf0;
  border-radius: 6px;
  padding: 10px;

  &:hover {
    border-color: rgba(0, 181, 173, 0.45);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }

  img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
}

.link-info {
  min-width: 0;

  p {
    margin: 0;
    color: #2f3237;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  span {
    display: block;
    margin-top: 2px;
    color: #8c929b;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 900px) {
  .about-layout {
    grid-template-columns: 1fr;
  }

  .about-left {
    border-right: none;
    border-bottom: 1px solid #edf0f2;
    padding: 20px 16px;
  }

  .avatar {
    width: 140px;
    height: 140px;
  }
}
</style>
