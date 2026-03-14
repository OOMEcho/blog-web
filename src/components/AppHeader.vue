<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="logo" @click="$router.push('/')">
        <span class="logo-text">{{ blogTitle }}</span>
      </div>
      <nav class="nav-links">
        <router-link to="/" exact>首页</router-link>
        <router-link to="/archive">归档</router-link>
        <router-link to="/about">关于</router-link>
      </nav>
      <div class="header-search">
        <el-input
          v-model="keyword"
          placeholder="搜索文章..."
          prefix-icon="el-icon-search"
          size="small"
          clearable
          @keyup.enter.native="handleSearch"
          @clear="handleSearchClear"
        />
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data () {
    return {
      keyword: ''
    }
  },
  computed: {
    blogTitle () {
      const configMap = this.$store.getters.configMap || {}
      return configMap.site_name || 'Blog'
    }
  },
  methods: {
    handleSearch () {
      if (this.keyword.trim()) {
        this.$router.push({ path: '/', query: { keyword: this.keyword.trim() } })
      }
    },
    handleSearchClear () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);

  .header-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .logo {
    cursor: pointer;
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #303133;
      letter-spacing: 1px;
    }
  }

  .nav-links {
    display: flex;
    gap: 24px;
    a {
      font-size: 15px;
      color: #606266;
      text-decoration: none;
      &:hover, &.router-link-active {
        color: #409EFF;
      }
    }
  }

  .header-search {
    margin-left: auto;
    width: 220px;
  }
}
</style>
