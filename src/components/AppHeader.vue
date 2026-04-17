<template>
  <header class="app-header">
    <div class="header-shell">
      <div class="header-inner">
        <div class="brand" @click="goHome">
          <span class="brand-title">{{ blogTitle }}</span>
        </div>

        <nav class="nav-links">
          <router-link to="/" exact><i class="el-icon-house" /> 首页</router-link>
          <router-link to="/category/-1"><i class="el-icon-folder-opened" /> 分类</router-link>
          <router-link to="/tag/-1"><i class="el-icon-price-tag" /> 标签</router-link>
          <router-link to="/archive"><i class="el-icon-collection" /> 归档</router-link>
          <router-link to="/links"><i class="el-icon-link" /> 友链</router-link>
          <router-link to="/about"><i class="el-icon-user" /> 关于我</router-link>
        </nav>

        <form class="search-form" @submit.prevent="handleSearch(keyword)">
          <input
            v-model.trim="keyword"
            class="search-input"
            type="text"
            placeholder="Search..."
          >
          <button class="search-btn" type="submit" aria-label="search">
            <i class="el-icon-search" />
          </button>
        </form>

        <button class="mobile-toggle" type="button" @click="mobileOpen = !mobileOpen">
          <i class="el-icon-menu" />
        </button>
      </div>

      <transition name="header-fade">
        <div v-if="mobileOpen" class="mobile-panel">
          <div class="mobile-nav">
            <router-link to="/" exact @click.native="mobileOpen = false"><i class="el-icon-house" /> 首页</router-link>
            <router-link to="/category/-1" @click.native="mobileOpen = false"><i class="el-icon-folder-opened" /> 分类</router-link>
            <router-link to="/tag/-1" @click.native="mobileOpen = false"><i class="el-icon-price-tag" /> 标签</router-link>
            <router-link to="/archive" @click.native="mobileOpen = false"><i class="el-icon-collection" /> 归档</router-link>
            <router-link to="/links" @click.native="mobileOpen = false"><i class="el-icon-link" /> 友链</router-link>
            <router-link to="/about" @click.native="mobileOpen = false"><i class="el-icon-user" /> 关于我</router-link>
          </div>
          <form class="mobile-search" @submit.prevent="handleSearch(mobileKeyword)">
            <input
              v-model.trim="mobileKeyword"
              type="text"
              placeholder="搜索文章..."
            >
            <button type="submit">搜索</button>
          </form>
        </div>
      </transition>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data () {
    return {
      keyword: '',
      mobileKeyword: '',
      mobileOpen: false
    }
  },
  computed: {
    blogTitle () {
      const configMap = this.$store.getters.configMap || {}
      return configMap.site_name || '我的博客'
    }
  },
  watch: {
    '$route.fullPath' () {
      this.syncKeywordFromRoute()
      this.mobileOpen = false
    }
  },
  created () {
    this.syncKeywordFromRoute()
  },
  methods: {
    safePush (location) {
      return this.$router.push(location).catch(err => {
        if (err && err.name !== 'NavigationDuplicated') {
          throw err
        }
      })
    },
    goHome () {
      const isHome = this.$route.path === '/'
      const hasQuery = Object.keys(this.$route.query || {}).length > 0
      if (isHome && !hasQuery) {
        return
      }
      this.safePush({ path: '/' })
    },
    syncKeywordFromRoute () {
      const routeKeyword = (this.$route.query.keyword || '').trim()
      this.keyword = routeKeyword
      this.mobileKeyword = routeKeyword
    },
    handleSearch (value) {
      const searchValue = (value || '').trim()
      this.keyword = searchValue
      this.mobileKeyword = searchValue

      if (searchValue) {
        if (this.$route.path === '/' && (this.$route.query.keyword || '') === searchValue) {
          this.mobileOpen = false
          return
        }
        this.safePush({ path: '/', query: { keyword: searchValue } })
      } else {
        this.goHome()
      }

      this.mobileOpen = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 120;
  background: #1b1c1d;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.header-shell {
  max-width: var(--layout-width);
  margin: 0 auto;
  padding: 0 18px;
}

.header-inner {
  height: 58px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  cursor: pointer;
  user-select: none;
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--blog-brand);
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;

    a {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      text-decoration: none;
    padding: 8px 14px;
    border-radius: 4px;
    transition: all 0.2s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 4px;
      width: 0;
      height: 2px;
      background: var(--blog-brand);
      border-radius: 2px;
      transform: translateX(-50%);
      transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }

    &:hover::after,
    &.router-link-exact-active::after,
    &.router-link-active::after {
      width: calc(100% - 24px);
    }

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
    }

    &.router-link-exact-active,
    &.router-link-active {
      color: #fff;
      background: rgba(0, 181, 173, 0.3);
    }
  }
}

.search-form {
  margin-left: auto;
  width: 250px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: var(--blog-brand);
    background: rgba(255, 255, 255, 0.16);
    box-shadow: 0 0 0 3px rgba(0, 181, 173, 0.18);
  }
}

.search-input {
  width: 100%;
  height: 34px;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  padding: 0 12px;
  font-size: 13px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.62);
  }
}

.search-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
}

.mobile-toggle {
  margin-left: auto;
  width: 34px;
  height: 34px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 4px;
  display: none;
}

.mobile-panel {
  display: none;
}

.header-fade-enter-active,
.header-fade-leave-active {
  transition: all 0.2s ease;
}

.header-fade-enter,
.header-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 980px) {
  .nav-links,
  .search-form {
    display: none;
  }

  .mobile-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-panel {
    display: block;
    padding: 0 0 14px;
  }

  .mobile-nav {
    display: grid;
    gap: 8px;
    margin-bottom: 10px;

    a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.86);
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.06);

      &.router-link-exact-active,
      &.router-link-active {
        color: #fff;
        background: rgba(0, 181, 173, 0.3);
      }
    }
  }

  .mobile-search {
    display: flex;
    gap: 8px;

    input {
      flex: 1;
      height: 34px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      padding: 0 10px;
      outline: none;
    }

    button {
      height: 34px;
      border: none;
      border-radius: 4px;
      padding: 0 14px;
      background: var(--blog-brand);
      color: #fff;
      cursor: pointer;
    }
  }
}
</style>
