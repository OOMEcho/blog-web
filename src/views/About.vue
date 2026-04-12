<template>
  <div class="page-about">
    <section class="about-layout">
      <aside class="about-left">
        <img class="avatar" :src="avatarUrl" alt="站点头像" @error="onAvatarError">
      </aside>

      <article class="about-right">
        <h2><i class="el-icon-user"/> 关于我</h2>

        <div class="about-content" v-html="aboutContent"/>

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

    <section class="project-panel" v-loading="projectLoading">
      <h3><i class="el-icon-collection"/> 开源项目</h3>
      <div v-if="normalizedProjects.length" class="project-grid">
        <a
          v-for="project in normalizedProjects"
          :key="project.id || project.name"
          :href="project.safeUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="project-item"
        >
          <img :src="resolveLogo(project.logo)" :alt="project.name" @error="onLogoError">
          <div class="project-info">
            <div class="project-header">
              <p>{{ project.name }}</p>
              <span v-if="project.stars !== null" class="stars">
                <i class="el-icon-star-off"/> {{ project.stars }}
              </span>
            </div>
            <span class="desc">{{ project.description || '暂无描述' }}</span>
            <div v-if="project.techStack" class="tech-stack">
              {{ project.techStack }}
            </div>
          </div>
        </a>
      </div>
      <p v-else class="empty-text">暂无开源项目</p>
    </section>
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { getOpenProjects } from '@/api/blog'

export default {
  name: 'AboutView',
  data () {
    return {
      defaultAvatar: '/images/default-avatar.png',
      projects: [],
      projectLoading: false
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
        links.push({
          key: 'github',
          label: 'GitHub',
          href: github
        })
      }
      if (gitee) {
        links.push({
          key: 'gitee',
          label: 'Gitee',
          href: gitee
        })
      }
      if (email) {
        links.push({
          key: 'email',
          label: email,
          href: `mailto:${email}`
        })
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
    normalizedProjects () {
      return this.projects
        .map(project => ({
          ...project,
          safeUrl: this.safeHttpUrl(project.url)
        }))
        .filter(project => !!project.safeUrl)
    }
  },
  created () {
    this.fetchProjects()
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
    resolveLogo (logo) {
      const value = (logo || '').trim()
      return value || this.defaultAvatar
    },
    onLogoError (event) {
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
    async fetchProjects () {
      this.projectLoading = true
      try {
        const data = await getOpenProjects()
        this.projects = Array.isArray(data) ? data : []
      } catch (e) {
        this.projects = []
      } finally {
        this.projectLoading = false
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

.project-panel {
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

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.project-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-decoration: none;
  border: 1px solid #e9edf0;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(0, 181, 173, 0.45);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid #f0f2f5;
  }
}

.project-info {
  min-width: 0;
  flex: 1;

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    p {
      margin: 0;
      color: #2f3237;
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stars {
      color: #e6a23c;
      font-size: 12px;
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
    }
  }

  .desc {
    display: block;
    margin-top: 4px;
    color: #606266;
    font-size: 12px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tech-stack {
    margin-top: 6px;
    font-size: 11px;
    color: #909399;
    background: #f4f4f5;
    padding: 2px 6px;
    border-radius: 3px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
