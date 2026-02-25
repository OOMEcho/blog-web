<template>
  <div class="page-about">
    <div class="page-inner">
      <main class="main-content">
        <el-card class="about-card" shadow="never">
          <div v-if="loading" v-loading="loading" style="min-height:200px" />
          <div v-else>
            <h1 class="about-title">关于</h1>
            <div
              class="about-content"
              v-html="aboutContent"
            />

            <!-- 友情链接 -->
            <div v-if="links.length" class="links-section">
              <h2>友情链接</h2>
              <div class="links-grid">
                <a
                  v-for="link in links"
                  :key="link.id"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-item"
                >
                  <img v-if="link.logo" :src="link.logo" :alt="link.name" class="link-logo" />
                  <div class="link-info">
                    <span class="link-name">{{ link.name }}</span>
                    <span class="link-desc">{{ link.description }}</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </el-card>
      </main>
      <app-sidebar class="sidebar" />
    </div>
  </div>
</template>

<script>
import AppSidebar from '../components/AppSidebar.vue'
import { getLinks } from '@/api/blog'

export default {
  name: 'AboutView',
  components: { AppSidebar },
  data () {
    return {
      links: [],
      loading: false
    }
  },
  computed: {
    configMap () {
      const config = this.$store.getters.blogConfig
      if (!config || !Array.isArray(config)) return {}
      return config.reduce((acc, c) => { acc[c.configKey] = c.configValue; return acc }, {})
    },
    aboutContent () {
      return this.configMap.blog_about || '<p>欢迎来到我的博客！</p>'
    }
  },
  created () {
    this.fetchLinks()
  },
  methods: {
    async fetchLinks () {
      this.loading = true
      try {
        const res = await getLinks()
        this.links = (res && res.data) ? res.data : (Array.isArray(res) ? res : [])
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
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px;
}
.page-inner {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}
.about-card {
  border-radius: 8px;
}
.about-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}
.about-content {
  font-size: 15px;
  color: #606266;
  line-height: 1.8;
}
.links-section {
  margin-top: 40px;
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
}
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  text-decoration: none;
  transition: box-shadow .2s, transform .2s;
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
    transform: translateY(-2px);
  }
  .link-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  .link-info {
    display: flex;
    flex-direction: column;
    .link-name {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
    .link-desc {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}
@media (max-width: 800px) {
  .page-inner { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
</style>
