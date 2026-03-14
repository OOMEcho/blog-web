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
      return this.$store.getters.configMap || {}
    },
    copyright () {
      if (this.configMap.site_footer) {
        return this.configMap.site_footer
      }
      const siteName = this.configMap.site_name || 'Blog'
      return `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`
    },
    icp () {
      return this.configMap.site_record_number || ''
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
