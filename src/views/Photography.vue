<template>
  <main class="photography-page">
    <header class="photography-heading">
      <div class="heading-row">
        <h1><i class="el-icon-camera" aria-hidden="true" />{{ albumId ? (album ? album.title : '相册') : '摄影' }}</h1>
        <router-link v-if="albumId" class="back-link" to="/photography"><i class="el-icon-back" aria-hidden="true" /> 全部相册</router-link>
      </div>
      <div v-if="album" class="album-meta">
        <span v-if="album.date"><i class="el-icon-date" aria-hidden="true" /> {{ album.date }}</span>
        <span><i class="el-icon-picture-outline" aria-hidden="true" /> {{ album.photoCount }} 张照片</span>
      </div>
      <p v-if="!albumId || (album && album.description)" class="photography-intro">{{ albumId ? album.description : '按旅行与拍摄主题，记录走过的地方。' }}</p>
    </header>

    <section class="photography-content" :aria-label="albumId ? '相册照片' : '摄影相册'">
      <div v-if="error" class="photo-state" role="alert">
        <i class="el-icon-warning-outline state-icon" aria-hidden="true" />
        <p>{{ error }}</p>
        <el-button class="photo-action" size="small" icon="el-icon-refresh" @click="load">重新加载</el-button>
      </div>
      <div v-else-if="loading" class="photo-state" role="status"><i class="el-icon-loading state-icon" aria-hidden="true" /><p>正在加载{{ albumId ? '照片' : '相册' }}…</p></div>
      <template v-else>
        <div v-if="!albumId" class="album-grid">
          <router-link v-for="(item, i) in albums" :key="item.id" class="album-card" :to="`/photography/${item.id}`">
            <div class="album-cover"><img v-if="item.coverPhotoId" :src="url(item.id, item.coverPhotoId)" :alt="item.title" width="800" height="600" :loading="i < 2 ? 'eager' : 'lazy'"></div>
            <div class="album-card-caption">
              <h2>{{ item.title }}</h2>
              <div class="album-card-meta"><span>{{ item.date || '拍摄记录' }}</span><span>{{ item.photoCount }} 张照片</span></div>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
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
        <el-empty v-if="!albumId && albums.length === 0" :image-size="80" description="还没有发布的相册" />
        <el-empty v-if="albumId && photos.length === 0" :image-size="80" description="这个相册暂时没有照片" />
        <div v-if="hasMore" class="load-more"><el-button class="photo-action" size="small" :loading="loadingMore" :disabled="loadingMore" @click="loadMore">{{ loadingMore ? '加载中…' : '加载更多' }}</el-button></div>
        <p v-if="moreError" class="more-error" role="alert">{{ moreError }}</p>
      </template>
    </section>
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
.photography-page {
  width: 100%;
  max-width: var(--content-width);
  margin: 24px auto 0;
  padding: 0 18px;
}
.photography-heading,
.photography-content {
  background: var(--blog-card);
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  box-shadow: var(--blog-shadow);
}
.photography-heading { padding: 20px 24px; }
.heading-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.photography-heading h1 { margin: 0; font-size: 22px; font-weight: 600; line-height: 1.5; color: var(--blog-brand-dark); overflow-wrap: anywhere; }
.photography-heading h1 > i { margin-right: 10px; }
.photography-intro { color: var(--blog-muted); font-size: 14px; line-height: 1.8; margin-top: 10px; white-space: pre-wrap; overflow-wrap: anywhere; }
.album-meta { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 12px; color: var(--blog-muted); font-size: 13px; }
.back-link { flex-shrink: 0; color: var(--blog-brand-dark); font-size: 13px; text-decoration: none; padding: 8px 0; }
.back-link:hover { text-decoration: underline; }
.photography-content { margin-top: 12px; padding: 24px; }
.album-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.album-card { overflow: hidden; color: inherit; text-decoration: none; display: block; border: 1px solid var(--blog-border); border-radius: 6px; transition: border-color .2s ease, box-shadow .2s ease; }
.album-card:hover { border-color: var(--blog-brand-dark); box-shadow: var(--blog-shadow); }
.album-cover { aspect-ratio: 4 / 3; background: var(--blog-bg); overflow: hidden; }
.album-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
.album-card:hover img { transform: scale(1.025); }
.album-card-caption { padding: 16px 18px; }
.album-card h2 { font-size: 18px; font-weight: 600; line-height: 1.5; margin-bottom: 8px; overflow-wrap: anywhere; }
.album-card-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; color: var(--blog-muted); font-size: 12px; }
.album-card-caption p { color: var(--blog-muted); font-size: 13px; margin-top: 10px; line-height: 1.8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: pre-wrap; overflow-wrap: anywhere; }
.photo-columns { columns: 3; column-gap: 20px; }
.photo-columns figure { break-inside: avoid; margin: 0 0 20px; }
.photo-open { border: 0; border-radius: 4px; overflow: hidden; padding: 0; width: 100%; display: block; cursor: zoom-in; background: var(--blog-bg); }
.photo-open img { display: block; width: 100%; height: auto; }
.photo-columns figcaption { font-size: 13px; color: var(--blog-muted); padding-top: 8px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.photo-state { text-align: center; color: var(--blog-muted); padding: 48px 12px; font-size: 14px; line-height: 1.8; }
.state-icon { font-size: 30px; color: var(--blog-brand-dark); }
.photo-state p { margin: 16px 0; }
.load-more { text-align: center; margin-top: 12px; }
.photo-action { min-width: 110px; border-color: var(--blog-brand-dark); color: var(--blog-brand-dark); background: var(--blog-card); }
.photo-action:hover,
.photo-action:focus { background: var(--blog-bg); border-color: var(--blog-brand-dark); color: var(--blog-brand-dark); }
.more-error { text-align: center; color: var(--blog-muted); font-size: 13px; margin-top: 12px; }
.photography-page :focus-visible { outline: 2px solid var(--blog-brand-dark); outline-offset: 3px; }
@media (max-width: 800px) { .photo-columns { columns: 2; } }
@media (max-width: 540px) {
  .photography-page { padding: 0 12px; margin-top: 16px; }
  .photography-heading { padding: 16px; }
  .heading-row { align-items: flex-start; gap: 12px; }
  .photography-heading h1 { font-size: 20px; }
  .photography-content { padding: 16px; }
  .album-grid { grid-template-columns: 1fr; gap: 18px; }
  .photo-columns { columns: 1; }
}
@media (prefers-reduced-motion: reduce) { .album-card, .album-cover img { transition: none; } }
</style>
