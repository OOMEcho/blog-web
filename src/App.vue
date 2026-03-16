<template>
  <div id="app">
    <app-header />
    <router-view class="app-view" />
    <app-footer />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: { AppHeader, AppFooter },
  created () {
    this.$store.dispatch('fetchBlogConfig').catch(() => {})
  }
}
</script>

<style>
:root {
  --blog-brand: #00b5ad;
  --blog-brand-dark: #009c95;
  --blog-bg: #f5f5f5;
  --blog-card: #ffffff;
  --blog-text: #333333;
  --blog-muted: #7d8087;
  --blog-border: #e8e8e8;
  --blog-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--blog-bg);
  background-image: radial-gradient(rgba(0, 0, 0, 0.045) 1px, transparent 1px);
  background-size: 12px 12px;
  color: var(--blog-text);
}

a {
  color: inherit;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-view {
  flex: 1;
}
</style>
