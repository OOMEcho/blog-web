<template>
  <div id="app">
    <particle-background />
    <app-header />
    <transition name="page" mode="out-in">
      <router-view class="app-view" />
    </transition>
    <app-footer />
    <particle-switcher />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ParticleBackground from './components/ParticleBackground.vue'
import ParticleSwitcher from './components/ParticleSwitcher.vue'

export default {
  name: 'App',
  components: { AppHeader, AppFooter, ParticleBackground, ParticleSwitcher },
  data () {
    return {
      live2dLoaded: false,
      live2dErrorHandler: null
    }
  },
  created () {
    this.$store.dispatch('fetchBlogConfig').catch(() => {})
  },
  mounted () {
    this.installLive2dErrorFilter()
    this.tryLoadLive2d()
    window.addEventListener('resize', this.tryLoadLive2d, { passive: true })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.tryLoadLive2d)
    if (this.live2dErrorHandler) {
      window.removeEventListener('error', this.live2dErrorHandler, true)
      this.live2dErrorHandler = null
    }
  },
  methods: {
    installLive2dErrorFilter () {
      if (typeof window === 'undefined' || this.live2dErrorHandler) {
        return
      }
      const handler = (event) => {
        const msg = (event && event.message) || ''
        const src = (event && event.filename) || ''
        if (msg.includes("reading 'hitTest'") && src.includes('live2d')) {
          event.stopImmediatePropagation()
          event.preventDefault()
        }
      }
      window.addEventListener('error', handler, true)
      this.live2dErrorHandler = handler
    },
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

.page-enter-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
