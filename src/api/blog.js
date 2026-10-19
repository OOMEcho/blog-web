import request from '../utils/request'

// ========== 文章 ==========

export function getArticles (params) {
  return request.get('/blog/articles', { params })
}

export function getArticleDetail (id) {
  return request.get(`/blog/articles/${id}`)
}

export function getArchives () {
  return request.get('/blog/archives')
}

export function searchArticles (params) {
  return request.get('/blog/search', { params })
}

// ========== 分类 / 标签 ==========

export function getCategories () {
  return request.get('/blog/categories')
}

export function getTags () {
  return request.get('/blog/tags')
}

// ========== 友链 ==========

export function getLinks () {
  return request.get('/blog/links')
}

// ========== 开源项目 ==========

export function getOpenProjects () {
  return request.get('/blog/projects')
}

// ========== 博客配置 ==========

export function getBlogConfig () {
  return request.get('/blog/config')
}

// ========== 摄影 ==========

export function getAlbums (params) {
  return request.get('/blog/photography/albums', { params })
}

export function getAlbum (id) {
  return request.get(`/blog/photography/albums/${id}`)
}

export function getPhotos (id, params) {
  return request.get(`/blog/photography/albums/${id}/photos`, { params })
}

export function photoUrl (albumId, photoId, variant = 'thumbnail') {
  const base = (request.defaults.baseURL || '').replace(/\/$/, '')
  return `${base}/blog/photography/albums/${encodeURIComponent(albumId)}/photos/${encodeURIComponent(photoId)}/${variant}`
}
