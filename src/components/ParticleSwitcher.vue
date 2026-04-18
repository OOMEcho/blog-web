<template>
  <div class="particle-switcher" :class="{ open }">
    <transition name="header-fade">
      <div v-if="open" class="panel" @click.stop>
        <div class="panel-title">背景特效</div>
        <button
          v-for="item in styles"
          :key="item.key"
          type="button"
          class="panel-item"
          :class="{ active: item.key === current }"
          @click="select(item.key)"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </transition>

    <button
      type="button"
      class="fab"
      :class="{ active: current !== 'off' }"
      aria-label="切换背景特效"
      @click.stop="toggle"
    >
      <i class="el-icon-magic-stick" />
    </button>
  </div>
</template>

<script>
import { PARTICLE_STYLES } from '@/config/particlePresets'

export default {
  name: 'ParticleSwitcher',
  data () {
    return {
      open: false,
      styles: PARTICLE_STYLES
    }
  },
  computed: {
    current () {
      return this.$store.getters.particleStyle
    }
  },
  mounted () {
    this.onDocClick = this.handleDocClick.bind(this)
    document.addEventListener('click', this.onDocClick)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.onDocClick)
  },
  methods: {
    toggle () {
      this.open = !this.open
    },
    select (key) {
      this.$store.dispatch('setParticleStyle', key)
      this.open = false
    },
    handleDocClick () {
      if (this.open) {
        this.open = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.particle-switcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 110;
}

.fab {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(27, 28, 29, 0.82);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, background-color 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: var(--blog-brand);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }
}

.panel {
  position: absolute;
  right: 0;
  bottom: 56px;
  min-width: 160px;
  background: #fff;
  border: 1px solid var(--blog-border);
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 12px;
  color: #9197a1;
  padding: 4px 10px 6px;
  border-bottom: 1px solid #f2f3f5;
  margin-bottom: 4px;
}

.panel-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 14px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;

  i {
    font-size: 16px;
    color: #7d8087;
  }

  &:hover {
    background: #f4f6f8;
  }

  &.active {
    color: var(--blog-brand-dark);
    background: #ecfffd;

    i {
      color: var(--blog-brand);
    }
  }
}

.header-fade-enter-active,
.header-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.header-fade-enter,
.header-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 980px) {
  .particle-switcher {
    display: none;
  }
}
</style>
