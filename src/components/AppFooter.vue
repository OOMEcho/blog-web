<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p class="copyright">{{ copyright }}</p>
      <p class="icp" v-if="icp">{{ icp }}</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    configMap () {
      const config = this.$store.getters.blogConfig
      if (!config || !Array.isArray(config)) return {}
      return config.reduce((acc, c) => { acc[c.configKey] = c.configValue; return acc }, {})
    },
    copyright () {
      return this.configMap.blog_footer || `© ${new Date().getFullYear()} Blog. All rights reserved.`
    },
    icp () {
      return this.configMap.blog_icp || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  background: #f5f7fa;
  border-top: 1px solid #e8e8e8;
  padding: 24px 20px;
  text-align: center;
  margin-top: 48px;

  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  p {
    margin: 4px 0;
    font-size: 13px;
    color: #909399;
  }
}
</style>
