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

// ========== 博客配置 ==========

export function getBlogConfig () {
  return request.get('/blog/config')
}

// ========== 评论 ==========

export function getComments (articleId) {
  return request.get(`/blog/comments/${articleId}`)
}

export function addComment (data) {
  return request.post('/blog/comments', data)
}
