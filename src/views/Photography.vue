<template>
  <main class="photography-page">
    <header class="photography-heading">
      <router-link v-if="albumId" class="back-link" to="/photography">← 全部相册</router-link>
      <p class="photography-label">{{ albumId ? '拍摄手记' : '光影记录' }}</p>
      <h1>{{ albumId ? (album ? album.title : '相册') : '摄影' }}</h1>
      <p v-if="album" class="album-meta">{{ album.date || '' }} <span>{{ album.photoCount }} 张照片</span></p>
      <p class="photography-intro">{{ albumId ? (album && album.description) : '走过的地方，留在照片里。' }}</p>
    </header>
    <div v-if="error" class="photo-state" role="alert"><p>{{ error }}</p><button @click="load">重新加载</button></div>
    <div v-else-if="loading" class="photo-state" role="status">正在加载{{ albumId ? '照片' : '相册' }}…</div>
    <template v-else>
      <div v-if="!albumId" class="album-grid">
        <router-link v-for="(item, i) in albums" :key="item.id" class="album-card" :to="`/photography/${item.id}`">
          <div class="album-cover"><img v-if="item.coverPhotoId" :src="url(item.id, item.coverPhotoId)" :alt="item.title" width="800" height="600" :loading="i < 2 ? 'eager' : 'lazy'"></div>
          <div class="album-card-caption"><h2>{{ item.title }}</h2><span>{{ item.date || '拍摄记录' }} · {{ item.photoCount }} 张</span><p>{{ item.description }}</p></div>
        </router-link>
      </div>
      <div v-else class="photo-columns">
        <figure v-for="(photo, i) in photos" :key="photo.id">
          <button type="button" class="photo-open" :aria-label="`查看${photo.caption || '照片 ' + (i + 1)}`" @click="openPhoto(i)">
            <img :src="url(albumId, photo.id)" :alt="photo.caption || '摄影作品'" :width="photo.width" :height="photo.height" :loading="i < 3 ? 'eager' : 'lazy'">
          </button>
          <figcaption v-if="photo.caption">{{ photo.caption }}</figcaption>
        </figure>
      </div>
      <p v-if="!albumId && albums.length === 0" class="photo-state">还没有发布的相册。</p>
      <p v-if="albumId && photos.length === 0" class="photo-state">这个相册暂时没有照片。</p>
      <div v-if="hasMore" class="load-more"><button :disabled="loadingMore" @click="loadMore">{{ loadingMore ? '加载中…' : '加载更多' }}</button></div>
      <p v-if="moreError" class="photo-state" role="alert">{{ moreError }}</p>
    </template>
    <photo-viewer v-if="viewerIndex >= 0 && photos[viewerIndex]" :photo="photos[viewerIndex]" :album-id="albumId" :index="viewerIndex" :total="total" :loading="loadingMore" :error="moreError" @close="closeViewer" @previous="viewerIndex--" @next="nextPhoto" />
  </main>
</template>

<script>
import { getAlbums, getAlbum, getPhotos, photoUrl } from '@/api/blog'
import PhotoViewer from '@/components/PhotoViewer.vue'
export default {
  name: 'PhotographyPage',
  components: { PhotoViewer },
  data () { return { albums: [], album: null, photos: [], page: 1, total: 0, loading: false, loadingMore: false, error: '', moreError: '', viewerIndex: -1, viewerSession: 0, generation: 0 } },
  computed: {
    albumId () { return this.$route.params.id || '' },
    hasMore () { return (this.albumId ? this.photos.length : this.albums.length) < this.total }
  },
  watch: { albumId: { immediate: true, handler () { this.load() } } },
  beforeDestroy () { this.generation++ },
  methods: {
    url: photoUrl,
    async load () {
      const generation = ++this.generation
      const id = this.albumId
      this.closeViewer(); this.loading = true; this.error = ''; this.moreError = ''; this.loadingMore = false
      this.album = null; this.albums = []; this.photos = []; this.page = 1; this.total = 0
      try {
        const [album, result] = id ? await Promise.all([getAlbum(id), getPhotos(id, { pageNum: 1, pageSize: 24 })]) : [null, await getAlbums({ pageNum: 1, pageSize: 12 })]
        if (generation !== this.generation) return
        this.album = album; this.total = Number(result.total)
        if (id) this.photos = result.records || []
        else this.albums = result.records || []
      } catch (e) { if (generation === this.generation) this.error = '暂时无法查看内容，相册可能已下架，请稍后重试。' } finally { if (generation === this.generation) this.loading = false }
    },
    async loadMore () {
      if (this.loadingMore || !this.hasMore) return false
      const generation = this.generation
      this.loadingMore = true; this.moreError = ''
      try {
        const params = { pageNum: this.page + 1, pageSize: this.albumId ? 24 : 12 }
        const result = this.albumId ? await getPhotos(this.albumId, params) : await getAlbums(params)
        if (generation !== this.generation) return false
        if (this.albumId) this.photos.push(...(result.records || []))
        else this.albums.push(...(result.records || []))
        this.total = Number(result.total); this.page++; return true
      } catch (e) { if (generation === this.generation) this.moreError = '加载失败，请重试。'; return false } finally { if (generation === this.generation) this.loadingMore = false }
    },
    openPhoto (index) { this.viewerSession++; this.viewerIndex = index },
    closeViewer () { this.viewerSession++; this.viewerIndex = -1 },
    async nextPhoto () {
      if (this.loadingMore) return
      const index = this.viewerIndex
      const session = this.viewerSession
      const generation = this.generation
      if (index + 1 < this.photos.length) this.viewerIndex++
      else if (this.hasMore && await this.loadMore() && generation === this.generation && session === this.viewerSession && this.viewerIndex === index && index + 1 < this.photos.length) this.viewerIndex++
    }
  }
}
</script>

<style scoped>
.photography-page { width: min(100% - 48px, 1120px); margin: 0 auto; padding: 52px 0 64px; }
.photography-heading { margin-bottom: 38px; max-width: 760px; }
.photography-label { color: var(--blog-brand-dark); font-size: 12px; letter-spacing: .2em; margin: 18px 0 12px; }
.photography-heading h1 { font-family: 'Songti SC', 'STSong', serif; font-size: clamp(34px, 5vw, 52px); font-weight: 500; letter-spacing: .08em; line-height: 1.4; }
.photography-intro { color: var(--blog-muted); line-height: 1.9; margin-top: 18px; white-space: pre-wrap; }
.album-meta { margin-top: 12px; color: var(--blog-muted); font-size: 13px; }.album-meta span { margin-left: 18px; }
.back-link { color: var(--blog-brand-dark); font-size: 13px; text-decoration: none; }
.album-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 30px; }
.album-card { color: inherit; text-decoration: none; display: block; }.album-cover { aspect-ratio: 4 / 3; background: #e4eceb; overflow: hidden; }
.album-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .25s; }.album-card:hover img { transform: scale(1.025); }
.album-card-caption { padding: 18px 0; border-bottom: 1px solid var(--blog-border); }.album-card h2 { font-size: 22px; font-weight: 500; margin-bottom: 8px; }
.album-card span { color: var(--blog-muted); font-size: 12px; }.album-card-caption p { color: var(--blog-muted); margin-top: 10px; line-height: 1.8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: pre-wrap; }
.photo-columns { columns: 3; column-gap: 20px; }.photo-columns figure { break-inside: avoid; margin-bottom: 24px; }
.photo-open { border: 0; padding: 0; width: 100%; display: block; cursor: zoom-in; background: #e4eceb; }.photo-open img { display: block; width: 100%; height: auto; }
.photo-columns figcaption { font-size: 13px; color: var(--blog-muted); padding-top: 10px; line-height: 1.7; white-space: pre-wrap; }
.photo-state { text-align: center; color: var(--blog-muted); padding: 44px 0; line-height: 2; }.load-more { text-align: center; margin-top: 28px; }
.load-more button, .photo-state button { padding: 12px 28px; border: 1px solid var(--blog-brand-dark); background: var(--blog-card); color: var(--blog-brand-dark); cursor: pointer; margin-top: 12px; }.load-more button:disabled { opacity: .5; }
.photography-page :focus-visible { outline: 2px solid var(--blog-brand-dark); outline-offset: 4px; }
@media (max-width: 800px) { .photo-columns { columns: 2; } }
@media (max-width: 540px) { .photography-page { width: calc(100% - 32px); padding-top: 26px; }.album-grid { grid-template-columns: 1fr; gap: 18px; }.photo-columns { columns: 1; }.photography-heading { margin-bottom: 24px; } }
@media (prefers-reduced-motion: reduce) { .album-cover img { transition: none; } }
</style>
