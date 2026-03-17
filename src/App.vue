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
  data () {
    return {
      live2dLoaded: false
    }
  },
  created () {
    this.$store.dispatch('fetchBlogConfig').catch(() => {})
  },
  mounted () {
    this.tryLoadLive2d()
    window.addEventListener('resize', this.tryLoadLive2d, { passive: true })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.tryLoadLive2d)
  },
  methods: {
    tryLoadLive2d () {
      if (this.live2dLoaded || typeof window === 'undefined') {
        return
      }

      if (window.innerWidth <= 980) {
        return
      }

      const existedScript = document.getElementById('live2d-widget-autoload')
      if (existedScript) {
        this.live2dLoaded = true
        return
      }

      const script = document.createElement('script')
      script.id = 'live2d-widget-autoload'
      script.src = 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/autoload.js'
      script.async = true
      script.onerror = () => {
        this.live2dLoaded = false
        console.warn('[live2d] widget load failed')
      }

      document.body.appendChild(script)
      this.live2dLoaded = true
    }
  }
}
</script>

<style>
:root {
  --layout-width: 72em;
  --content-width: 68em;
  --content-narrow-width: 60em;
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

#waifu,
#waifu-toggle {
  z-index: 100 !important;
}

@media (max-width: 980px) {
  #waifu,
  #waifu-toggle {
    display: none !important;
  }
}
</style>
