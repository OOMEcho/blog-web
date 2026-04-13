<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-bottom">
        <p class="footer-line">
          <span>© 2020-{{ currentYear }}</span>
          <span class="dot">·</span>
          <span>{{ siteFooter || '记录与分享，保持热爱' }}</span>
        </p>

        <p class="footer-line">
          <span>ICP证：</span>
          <a
            v-if="icpNumber"
            :href="icpUrl"
            target="_blank"
            rel="noopener noreferrer"
          >{{ icpNumber }}</a>
          <span v-else class="muted">未配置ICP备案号</span>

          <span class="dot">|</span>

          <img
            v-if="!beianIconError"
            src="/images/beian.png"
            alt="备案图标"
            class="beian-icon"
            width="20"
            height="20"
            loading="lazy"
            decoding="async"
            @error="beianIconError = true"
          >
          <a
            v-if="publicSecurityRecord"
            :href="publicSecurityUrl"
            target="_blank"
            rel="noopener noreferrer"
          >{{ publicSecurityRecord }}</a>
          <span v-else class="muted">未配置公安备案号</span>
        </p>

        <p class="footer-line runtime">{{ runtimeText }}</p>
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
      beianIconError: false,
      siteStart: new Date('2020/08/18 00:00:00').getTime()
    }
  },
  computed: {
    configMap () {
      return this.$store.getters.configMap || {}
    },
    siteFooter () {
      return (this.configMap.site_footer || '').trim()
    },
    icpNumber () {
      return (this.configMap.site_record_number || '').trim()
    },
    icpUrl () {
      return this.normalizeUrl(this.configMap.site_record_url, 'https://beian.miit.gov.cn')
    },
    publicSecurityRecord () {
      return (this.configMap.site_public_security_record_number || '').trim()
    },
    publicSecurityUrl () {
      return this.normalizeUrl(
        this.configMap.site_public_security_record_url,
        'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=51172402000111'
      )
    },
    currentYear () {
      return new Date(this.now).getFullYear()
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
    normalizeUrl (value, fallback) {
      const raw = (value || '').trim()
      if (!raw) {
        return fallback
      }
      if (/^https?:\/\//i.test(raw)) {
        return raw
      }
      if (/^[a-zA-Z]+:/i.test(raw)) {
        return fallback
      }
      return `https://${raw}`
    }
  }
}
</script>

<style lang="scss" scoped>
.app-footer {
  margin-top: 36px;
  background: #1b1c1d;
  color: rgba(255, 255, 255, 0.75);
  padding: 20px 20px 16px;
}

.footer-inner {
  max-width: var(--layout-width);
  margin: 0 auto;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;

  a {
    color: rgba(255, 255, 255, 0.82);
    text-decoration: none;

    &:hover {
      color: #ffffff;
      text-decoration: underline;
    }
  }
}

.footer-line {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.66);
}

.dot {
  opacity: 0.45;
}

.muted {
  opacity: 0.55;
}

.beian-icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

.runtime {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}
</style>
