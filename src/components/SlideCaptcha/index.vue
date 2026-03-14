<template>
  <div class="slide-captcha-container">
    <div class="captcha-header">
      <span>拖动滑块完成验证</span>
      <button class="refresh-btn" :disabled="isSliding || isVerifying" @click="refreshCaptcha">刷新</button>
    </div>

    <div v-if="captchaData && !loadError" class="captcha-main">
      <div class="background-container">
        <img :src="captchaData.backgroundImage" class="background-image" alt="captcha-bg">
        <img
          :src="captchaData.sliderImage"
          class="slider-image"
          :class="{sliding: isSliding}"
          :style="sliderImageStyle"
          alt="captcha-slider"
        >
      </div>

      <div class="slide-track">
        <div class="slide-track-bg">
          <div class="slide-progress" :class="{sliding: isSliding, verifying: isVerifying}" :style="slideProgressStyle"></div>
          <span v-if="!isSliding && !isVerifying && slideProgress === 0" class="slide-text">向右滑动验证</span>
          <span v-if="isVerifying" class="slide-text">验证中...</span>
        </div>

        <div
          class="slide-button"
          :class="{sliding: isSliding, verifying: isVerifying}"
          :style="sliderButtonStyle"
          @mousedown="startSlide"
          @touchstart="startSlide"
        >
          <span v-if="!isVerifying">→</span>
          <span v-else>⊙</span>
        </div>
      </div>
    </div>

    <div v-else-if="!loadError" class="captcha-message">验证码加载中...</div>
    <div v-else class="captcha-message error">验证码加载失败，请刷新重试</div>
  </div>
</template>

<script>
import { generateCaptcha } from '@/api/auth'

export default {
  name: 'SlideCaptcha',
  data () {
    return {
      captchaData: null,
      sliderPosition: 0,
      slideProgress: 0,
      isSliding: false,
      isVerifying: false,
      startX: 0,
      maxSlideDistance: 260,
      loadError: false
    }
  },
  computed: {
    sliderImageStyle () {
      const top = this.captchaData ? `${this.captchaData.sliderY}px` : '0px'
      return {
        top,
        transform: `translate3d(${this.sliderPosition}px, 0, 0)`
      }
    },
    sliderButtonStyle () {
      return {
        transform: `translate3d(${this.sliderPosition}px, 0, 0)`
      }
    },
    slideProgressStyle () {
      return {
        transform: `scaleX(${this.slideProgress / 100})`
      }
    }
  },
  mounted () {
    this.loadCaptcha()
  },
  beforeDestroy () {
    this.cleanupListeners()
  },
  methods: {
    async loadCaptcha () {
      try {
        this.loadError = false
        const res = await generateCaptcha()
        this.captchaData = res && res.data ? res.data : res
        this.resetSlider()
      } catch (error) {
        this.loadError = true
        this.$emit('load-error', error)
      }
    },
    refreshCaptcha () {
      this.loadCaptcha()
    },
    resetSlider () {
      this.sliderPosition = 0
      this.slideProgress = 0
      this.isSliding = false
      this.isVerifying = false
    },
    setVerifying (status) {
      this.isVerifying = status
    },
    startSlide (event) {
      if (this.isVerifying) {
        return
      }
      this.isSliding = true
      this.startX = this.getEventX(event)
      event.preventDefault()

      document.addEventListener('mousemove', this.onSliding, { passive: false })
      document.addEventListener('mouseup', this.stopSlide)
      document.addEventListener('touchmove', this.onSliding, { passive: false })
      document.addEventListener('touchend', this.stopSlide)
    },
    onSliding (event) {
      if (!this.isSliding) {
        return
      }
      const deltaX = this.getEventX(event) - this.startX
      const nextX = Math.max(0, Math.min(deltaX, this.maxSlideDistance))
      this.sliderPosition = nextX
      this.slideProgress = (nextX / this.maxSlideDistance) * 100
      event.preventDefault()
    },
    stopSlide () {
      if (!this.isSliding) {
        return
      }
      this.isSliding = false
      this.isVerifying = true
      this.cleanupListeners()
      this.$emit('slide-complete', {
        captchaKey: this.captchaData.captchaKey,
        slideX: Math.round(this.sliderPosition)
      })
    },
    getEventX (event) {
      return event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX
    },
    cleanupListeners () {
      document.removeEventListener('mousemove', this.onSliding)
      document.removeEventListener('mouseup', this.stopSlide)
      document.removeEventListener('touchmove', this.onSliding)
      document.removeEventListener('touchend', this.stopSlide)
    }
  }
}
</script>

<style scoped>
.slide-captcha-container {
  width: 320px;
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.captcha-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f7;
  color: #64748b;
  font-size: 13px;
}

.refresh-btn {
  border: none;
  background: transparent;
  color: #409eff;
  cursor: pointer;
}

.refresh-btn:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.background-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
}

.background-image {
  width: 100%;
  height: 100%;
  user-select: none;
}

.slider-image {
  position: absolute;
  width: 60px;
  height: 60px;
  transition: transform 0.1s ease-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  user-select: none;
  pointer-events: none;
}

.slider-image.sliding {
  transition: none;
}

.slide-track {
  position: relative;
  height: 50px;
  padding: 0 6px;
  display: flex;
  align-items: center;
}

.slide-track-bg {
  width: 100%;
  height: 38px;
  border-radius: 20px;
  background: #edf2f7;
  overflow: hidden;
  position: relative;
}

.slide-progress {
  height: 100%;
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 0.1s ease-out;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.slide-progress.sliding {
  transition: none;
}

.slide-progress.verifying {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.slide-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #64748b;
  font-size: 13px;
  user-select: none;
}

.slide-button {
  position: absolute;
  left: 6px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: #334155;
  transition: transform 0.1s ease-out;
  user-select: none;
}

.slide-button.sliding {
  cursor: grabbing;
}

.slide-button.verifying {
  cursor: not-allowed;
}

.captcha-message {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
}

.captcha-message.error {
  color: #ef4444;
}
</style>
