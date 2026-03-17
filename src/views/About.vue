<template>
  <div class="page-about">
    <div class="about-top">
      <section class="about-cover">
        <img :src="coverImage" alt="cover">
      </section>

      <section class="about-profile">
        <h2><i class="el-icon-user" /> 关于我</h2>
        <p class="about-text">{{ aboutText }}</p>

        <div class="interest-list">
          <span>编程</span>
          <span>学习</span>
          <span>分享</span>
          <span>成长</span>
        </div>

        <div class="skill-list">
          <span v-for="item in skillTags" :key="item">{{ item }}</span>
        </div>

        <div class="social-links">
          <a
            v-for="item in socialLinks"
            :key="item.key"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
          >{{ item.label }}</a>
        </div>
      </section>
    </div>

    <section class="link-panel" v-loading="loading">
      <h3>友情链接</h3>
      <div class="link-grid" v-if="normalizedLinks.length">
        <a
          v-for="link in normalizedLinks"
          :key="link.id"
          :href="link.safeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="link-item"
        >
          <img v-if="link.logo" :src="link.logo" :alt="link.name">
          <div>
            <p>{{ link.name }}</p>
            <span>{{ link.description || '欢迎互访交流' }}</span>
          </div>
        </a>
      </div>
      <el-empty v-else-if="!loading" description="暂无友情链接" />
    </section>

    <section class="about-html">
      <h3>更多介绍</h3>
      <div class="content" v-html="aboutContent" />
    </section>
  </div>
</template>

<script>
import { getLinks } from '@/api/blog'
import DOMPurify from 'dompurify'

export default {
  name: 'AboutView',
  data () {
    return {
      links: [],
      loading: false,
      defaultCover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
    }
  },
  computed: {
    configMap () {
      return this.$store.getters.configMap || {}
    },
    coverImage () {
      return this.configMap.site_avatar || this.defaultCover
    },
    aboutContent () {
      const raw = this.configMap.site_about || '<p>欢迎来到我的博客！</p>'
      return DOMPurify.sanitize(raw)
    },
    aboutText () {
      const raw = this.aboutContent.replace(/<[^>]+>/g, '').trim()
      if (!raw) {
        return '一个热爱技术、持续学习的开发者。'
      }
      return raw.slice(0, 120)
    },
    skillTags () {
      const tags = this.$store.getters.tags || []
      if (!tags.length) {
        return ['Java', 'Spring', 'Vue', 'MySQL', 'Linux', 'Nginx']
      }
      return tags.slice(0, 8).map(item => item.name)
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
        links.push({ key: 'email', label: '邮箱', href: `mailto:${email}` })
      }
      if (qq) {
        links.push({ key: 'qq', label: `QQ ${qq}`, href: `https://wpa.qq.com/msgrd?v=3&uin=${qq}&site=qq&menu=yes` })
      }

      return links
    },
    normalizedLinks () {
      return this.links
        .map(item => ({
          ...item,
          safeUrl: this.safeHttpUrl(item.url)
        }))
        .filter(item => !!item.safeUrl)
    }
  },
  created () {
    this.fetchLinks()
  },
  methods: {
    safeHttpUrl (value) {
      const url = (value || '').trim()
      if (!url) {
        return ''
      }
      if (/^https?:\/\//i.test(url)) {
        return url
      }
      if (/^[a-zA-Z]+:/i.test(url)) {
        return ''
      }
      return `https://${url}`
    },
    async fetchLinks () {
      this.loading = true
      try {
        const res = await getLinks()
        this.links = Array.isArray(res) ? res : []
      } catch (e) {
        this.links = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-about {
  max-width: 1120px;
  margin: 24px auto 0;
  padding: 0 18px;
}

.about-top,
.link-panel,
.about-html {
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
}

.about-top {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0;
  overflow: hidden;
}

.about-cover img {
  width: 100%;
  height: 100%;
  min-height: 360px;
  object-fit: cover;
}

.about-profile {
  padding: 18px;
  border-left: 1px solid #eef0f2;

  h2 {
    margin: 0;
    color: var(--blog-brand-dark);
    font-size: 24px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}

.about-text {
  margin: 12px 0;
  color: #525963;
  line-height: 1.8;
  font-size: 14px;
}

.interest-list,
.skill-list,
.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.interest-list span,
.skill-list span {
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #e0e4ea;
  color: #5e6670;
}

.skill-list span {
  background: #effcfb;
  border-color: #c8f0ec;
  color: #0f8f88;
}

.social-links a {
  text-decoration: none;
  font-size: 12px;
  border-radius: 14px;
  border: 1px solid #dce0e8;
  color: #4f5761;
  padding: 4px 10px;

  &:hover {
    color: var(--blog-brand-dark);
    border-color: rgba(0, 181, 173, 0.4);
  }
}

.link-panel {
  margin-top: 12px;
  padding: 14px;

  h3 {
    margin: 0 0 12px;
    color: #2f3237;
    font-size: 20px;
  }
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  padding: 10px;
  text-decoration: none;

  &:hover {
    border-color: rgba(0, 181, 173, 0.35);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    color: #2f3237;
    font-size: 14px;
    font-weight: 600;
  }

  span {
    color: #868b93;
    font-size: 12px;
  }
}

.about-html {
  margin-top: 12px;
  padding: 14px;

  h3 {
    margin: 0 0 10px;
    color: #2f3237;
    font-size: 20px;
  }
}

.content {
  color: #444;
  line-height: 1.85;
  font-size: 14px;
}

.content :deep(img) {
  max-width: 100%;
}

@media (max-width: 920px) {
  .about-top {
    grid-template-columns: 1fr;
  }

  .about-cover img {
    min-height: 260px;
  }

  .about-profile {
    border-left: none;
    border-top: 1px solid #eef0f2;
  }
}
</style>
