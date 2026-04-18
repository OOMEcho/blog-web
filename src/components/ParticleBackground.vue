<template>
  <div ref="box" id="tsparticles-bg" class="particle-bg" />
</template>

<script>
import { PARTICLE_PRESETS } from '@/config/particlePresets'

let enginePromise = null

function loadEngine () {
  if (enginePromise) {
    return enginePromise
  }
  enginePromise = Promise.all([
    import(/* webpackChunkName: "tsparticles" */ '@tsparticles/engine'),
    import(/* webpackChunkName: "tsparticles" */ '@tsparticles/slim'),
    import(/* webpackChunkName: "tsparticles" */ '@tsparticles/plugin-emitters')
  ]).then(async ([engineMod, slimMod, emittersMod]) => {
    await slimMod.loadSlim(engineMod.tsParticles)
    await emittersMod.loadEmittersPlugin(engineMod.tsParticles)
    return engineMod.tsParticles
  })
  return enginePromise
}

function prefersReducedMotion () {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (e) {
    return false
  }
}

export default {
  name: 'ParticleBackground',
  data () {
    return {
      instance: null,
      disabled: false
    }
  },
  computed: {
    style () {
      return this.$store.getters.particleStyle
    }
  },
  watch: {
    style () {
      this.reload()
    }
  },
  mounted () {
    this.disabled = this.shouldDisable()
    this.onResize = this.handleResize.bind(this)
    window.addEventListener('resize', this.onResize, { passive: true })
    this.reload()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
    this.destroyInstance()
  },
  methods: {
    shouldDisable () {
      if (typeof window === 'undefined') {
        return true
      }
      if (window.innerWidth <= 980) {
        return true
      }
      if (prefersReducedMotion()) {
        return true
      }
      return false
    },
    handleResize () {
      const nextDisabled = this.shouldDisable()
      if (nextDisabled === this.disabled) {
        return
      }
      this.disabled = nextDisabled
      this.reload()
    },
    destroyInstance () {
      if (this.instance && typeof this.instance.destroy === 'function') {
        this.instance.destroy()
      }
      this.instance = null
    },
    async reload () {
      this.destroyInstance()
      if (this.disabled || this.style === 'off') {
        return
      }
      const preset = PARTICLE_PRESETS[this.style]
      if (!preset) {
        return
      }
      try {
        const engine = await loadEngine()
        if (this.style === 'off' || this.disabled) {
          return
        }
        this.instance = await engine.load({
          id: 'tsparticles-bg',
          element: this.$refs.box,
          options: preset
        })
      } catch (err) {
        console.warn('[particles] load failed', err)
      }
    }
  }
}
</script>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
</style>
