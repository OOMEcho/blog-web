<template>
  <div ref="dialog" class="photo-viewer" role="dialog" aria-modal="true" aria-label="照片浏览" tabindex="-1">
    <header class="viewer-tools">
      <span aria-live="polite">{{ index + 1 }} / {{ total }}</span>
      <div>
        <a :href="originalUrl" download><i class="el-icon-download" aria-hidden="true" /> 下载原图</a>
        <button type="button" aria-label="关闭照片浏览" @click="$emit('close')"><i class="el-icon-close" aria-hidden="true" /> 关闭</button>
      </div>
    </header>
    <div class="viewer-stage" @touchstart="touchStart" @touchend="touchEnd">
      <button type="button" class="viewer-prev" :disabled="index === 0" aria-label="上一张" @click="$emit('previous')">‹</button>
      <img v-if="!failed" :key="photo.id" :src="displayUrl" :alt="photo.caption || '摄影作品'" @error="failed = true">
      <div v-else class="viewer-error" role="status">照片加载失败，请关闭后重新打开相册。</div>
      <button type="button" class="viewer-next" :disabled="index + 1 >= total || loading" aria-label="下一张" @click="$emit('next')">›</button>
    </div>
    <footer class="viewer-caption">
      <p v-if="error" role="alert">{{ error }}</p>
      <p v-if="photo.caption">{{ photo.caption }}</p>
      <p class="viewer-exif">{{ details }}</p>
    </footer>
  </div>
</template>

<script>
import { photoUrl } from '@/api/blog'
export default {
  name: 'PhotoViewer',
  props: { photo: { type: Object, required: true }, albumId: { type: [String, Number], required: true }, index: Number, total: Number, loading: Boolean, error: String },
  data () { return { failed: false, touch: null, oldOverflow: '', previousFocus: null } },
  computed: {
    displayUrl () { return photoUrl(this.albumId, this.photo.id, 'display') },
    originalUrl () { return photoUrl(this.albumId, this.photo.id, 'original') },
    details () { return [this.photo.takenAt, this.photo.camera, this.photo.lens, this.photo.aperture, this.photo.shutter, this.photo.iso ? `ISO ${this.photo.iso}` : ''].filter(Boolean).join(' · ') }
  },
  watch: { 'photo.id' () { this.failed = false } },
  mounted () {
    this.previousFocus = document.activeElement
    this.oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    this.$refs.dialog.focus()
    window.addEventListener('keydown', this.onKey)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.onKey)
    document.body.style.overflow = this.oldOverflow
    if (this.previousFocus && this.previousFocus.isConnected) this.previousFocus.focus()
  },
  methods: {
    onKey (event) {
      if (event.key === 'Escape') this.$emit('close')
      if (event.key === 'ArrowLeft' && this.index > 0) this.$emit('previous')
      if (event.key === 'ArrowRight' && this.index + 1 < this.total && !this.loading) this.$emit('next')
      if (event.key === 'Tab') {
        const controls = [...this.$refs.dialog.querySelectorAll('button:not(:disabled), a[href]')]
        const first = controls[0]; const last = controls[controls.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === this.$refs.dialog || !this.$refs.dialog.contains(document.activeElement))) { event.preventDefault(); last.focus() } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === this.$refs.dialog || !this.$refs.dialog.contains(document.activeElement))) { event.preventDefault(); first.focus() }
      }
      if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault()
    },
    touchStart (event) { this.touch = event.changedTouches[0] },
    touchEnd (event) {
      if (!this.touch) return
      const end = event.changedTouches[0]; const dx = end.clientX - this.touch.clientX; const dy = end.clientY - this.touch.clientY
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx > 0 && this.index > 0) this.$emit('previous')
        if (dx < 0 && this.index + 1 < this.total && !this.loading) this.$emit('next')
      }
      this.touch = null
    }
  }
}
</script>

<style scoped>
.photo-viewer { position: fixed; inset: 0; z-index: 3000; background: #15191d; color: #f2f4f5; display: flex; flex-direction: column; padding: 16px 24px; }
.viewer-tools { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding-bottom: 12px; border-bottom: 1px solid #30383e; }
.viewer-tools > div { display: flex; gap: 16px; align-items: center; }
.viewer-tools a { display: inline-flex; align-items: center; gap: 6px; color: #c0e7e3; text-decoration: none; min-height: 44px; padding: 10px 12px; border-radius: 6px; }
.viewer-tools a:hover, .viewer-tools button:hover { background: #ffffff12; }
.photo-viewer .viewer-tools button { padding: 8px 12px; border-radius: 6px; font-size: 13px; }
.photo-viewer button { border: 0; background: transparent; color: inherit; cursor: pointer; min-height: 44px; min-width: 44px; font-size: 16px; }
.photo-viewer button:disabled { opacity: .25; cursor: default; }
.photo-viewer :focus-visible { outline: 2px solid #93d5cf; outline-offset: 3px; }
.viewer-stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; touch-action: pan-y pinch-zoom; }
.viewer-stage img { display: block; width: calc(100% - 112px); height: 100%; object-fit: contain; }
.viewer-stage button { font-size: 44px; }
.viewer-caption { text-align: center; padding: 14px 0 6px; line-height: 1.8; max-height: 24vh; overflow: auto; white-space: pre-wrap; }
.viewer-exif { color: #a8b3bd; font-size: 12px; }
.viewer-error { color: #c7cbd0; }
@media (max-width: 640px) { .photo-viewer { padding: 8px; } .viewer-stage { position: relative; gap: 0; } .viewer-stage img { width: 100%; } .viewer-stage button { position: absolute; background: #15191d88; bottom: 12px; border-radius: 50%; } .viewer-prev { left: 4px; } .viewer-next { right: 4px; } .viewer-caption { padding: 8px; } }
</style>
