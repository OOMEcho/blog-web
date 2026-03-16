<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <section class="footer-col">
          <h4>站点</h4>
          <p class="site-title">{{ siteName }}</p>
          <p class="site-desc">{{ siteDesc }}</p>
        </section>

        <section class="footer-col">
          <h4>联系我</h4>
          <p v-if="configMap.social_qq">QQ：{{ configMap.social_qq }}</p>
          <p v-if="configMap.social_email">Email：{{ configMap.social_email }}</p>
          <p v-if="!configMap.social_qq && !configMap.social_email">欢迎通过站内资料页联系我</p>
        </section>

        <section class="footer-col">
          <h4>相关链接</h4>
          <div class="footer-links">
            <a v-for="item in socialLinks" :key="item.name" :href="item.url" target="_blank" rel="noopener noreferrer">
              {{ item.name }}
            </a>
            <router-link v-if="!socialLinks.length" to="/about">关于我</router-link>
          </div>
        </section>

        <section class="footer-col">
          <h4>导航</h4>
          <div class="footer-links">
            <router-link to="/">首页</router-link>
            <router-link to="/category/-1">分类</router-link>
            <router-link to="/tag/-1">标签</router-link>
            <router-link to="/archive">归档</router-link>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <p>
          Copyright © {{ currentYear }} {{ siteName }}
          <span v-if="icp"> | ICP：{{ icp }}</span>
        </p>
        <p>{{ runtimeText }}</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data () {
    return {
      now: Date.now(),
      timer: null,
      siteStart: new Date('2020/08/18 00:00:00').getTime()
    }
  },
  computed: {
    configMap () {
      return this.$store.getters.configMap || {}
    },
    siteName () {
      return this.configMap.site_name || '我的博客'
    },
    siteDesc () {
      return this.configMap.site_footer || this.configMap.site_description || '分享学习记录与技术笔记'
    },
    icp () {
      return this.configMap.site_record_number || ''
    },
    currentYear () {
      return new Date(this.now).getFullYear()
    },
    socialLinks () {
      const links = []
      const github = this.normalizeUrl(this.configMap.social_github)
      const gitee = this.normalizeUrl(this.configMap.social_gitee)

      if (github) {
        links.push({ name: 'GitHub', url: github })
      }
      if (gitee) {
        links.push({ name: 'Gitee', url: gitee })
      }
      return links
    },
    runtimeText () {
      const diff = this.now - this.siteStart
      if (!Number.isFinite(diff) || diff < 0) {
        return '本站持续稳定运行中'
      }

      const day = Math.floor(diff / (24 * 60 * 60 * 1000))
      const hour = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      const minute = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
      const second = Math.floor((diff % (60 * 1000)) / 1000)
      return `本站已安全运行 ${day} 天 ${hour} 小时 ${minute} 分 ${second} 秒`
    }
  },
  mounted () {
    this.timer = setInterval(() => {
      this.now = Date.now()
    }, 1000)
  },
  beforeDestroy () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    normalizeUrl (url) {
      const value = (url || '').trim()
      if (!value) {
        return ''
      }
      return /^https?:\/\//i.test(value) ? value : `https://${value}`
    }
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  margin-top: 48px;
  background: #1b1c1d;
  color: rgba(255, 255, 255, 0.75);
  padding: 34px 20px 16px;
}

.footer-inner {
  max-width: 1120px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.footer-col {
  h4 {
    color: var(--blog-brand);
    margin-bottom: 10px;
    font-size: 15px;
  }

  p {
    font-size: 13px;
    line-height: 1.7;
    margin-bottom: 4px;
  }
}

.site-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;

  a {
    color: rgba(255, 255, 255, 0.78);
    text-decoration: none;
    font-size: 13px;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
}

.footer-bottom {
  margin-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 12px;
  text-align: center;

  p {
    margin: 4px 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
