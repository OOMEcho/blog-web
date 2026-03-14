<template>
  <div class="page-detail">
    <div class="page-inner">
      <main class="main-content">
        <el-card v-loading="loading" class="article-main" shadow="never">
          <template v-if="article">
            <!-- 封面 -->
            <div class="cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" />
            </div>

            <!-- 标题 -->
            <h1 class="article-title">{{ article.title }}</h1>

            <!-- 元信息 -->
            <div class="article-meta">
              <span class="meta-item">
                <i class="el-icon-user" /> {{ article.authorName || article.author || '博主' }}
              </span>
              <span class="meta-item">
                <i class="el-icon-time" /> {{ formatDate(article.createTime) }}
              </span>
              <span class="meta-item" v-if="article.categoryName">
                <i class="el-icon-folder-opened" />
                <router-link v-if="article.categoryId" :to="`/category/${article.categoryId}`">{{ article.categoryName }}</router-link>
                <span v-else>{{ article.categoryName }}</span>
              </span>
              <span class="meta-item">
                <i class="el-icon-view" /> {{ article.viewCount || 0 }} 次阅读
              </span>
            </div>

            <!-- 标签 -->
            <div class="article-tags" v-if="articleTagList.length">
              <el-tag
                v-for="tag in articleTagList"
                :key="tag.id"
                size="small"
                type="info"
                @click.native="$router.push(`/tag/${tag.id}`)"
                style="cursor:pointer;margin-right:8px"
              >{{ tag.name }}</el-tag>
            </div>

            <!-- 正文（只读 mavon-editor 预览） -->
            <div class="article-body">
              <mavon-editor
                :value="article.content || ''"
                :subfield="false"
                :default-open="'preview'"
                :toolbars-flag="false"
                :editable="false"
                :scroll-style="true"
                :box-shadow="false"
              />
            </div>
          </template>
          <el-empty v-else-if="!loading" description="文章不存在" />
        </el-card>

        <!-- 评论区 -->
        <el-card class="comment-section" shadow="never" v-if="article">
          <div slot="header" class="comment-header">
            <i class="el-icon-chat-dot-round" /> 评论（{{ comments.length }}）
          </div>

          <!-- 评论列表 -->
          <div class="comment-list" v-loading="commentLoading">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-author">
                <img :src="comment.avatar || defaultAvatar" class="comment-avatar" alt="avatar" />
                <div class="comment-content">
                  <div class="comment-info">
                    <span class="author-name">{{ comment.nickname }}</span>
                    <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>

                  <!-- 子评论 -->
                  <div v-if="comment.children && comment.children.length" class="child-comments">
                    <div
                      v-for="child in comment.children"
                      :key="child.id"
                      class="comment-item child"
                    >
                      <img :src="child.avatar || defaultAvatar" class="comment-avatar small" alt="avatar" />
                      <div class="comment-content">
                        <div class="comment-info">
                          <span class="author-name">{{ child.nickname }}</span>
                          <span class="comment-time">{{ formatDate(child.createTime) }}</span>
                        </div>
                        <p class="comment-text">{{ child.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-if="!commentLoading && comments.length === 0" description="暂无评论，快来抢沙发吧~" />
          </div>

          <!-- 发表评论 -->
          <div class="comment-form">
            <h3 class="form-title">发表评论</h3>
            <div v-if="!isLoggedIn" class="comment-login-tip">
              <p>评论需要登录后才能发布。</p>
              <el-button type="primary" size="small" @click="openLoginDialog">登录评论</el-button>
            </div>
            <el-form v-else :model="commentForm" ref="commentForm" :rules="commentRules" label-width="80px">
              <el-form-item label="评论" prop="content">
                <el-input
                  v-model="commentForm.content"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入评论内容..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitComment" :loading="submitting">
                  提交评论
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </main>
      <app-sidebar class="sidebar" />
    </div>

    <comment-login-dialog :visible.sync="loginDialogVisible" @login-success="handleLoginSuccess" />
  </div>
</template>

<script>
import AppSidebar from '../components/AppSidebar.vue'
import CommentLoginDialog from '@/components/CommentLoginDialog.vue'
import { getArticleDetail, getComments, addComment } from '@/api/blog'
import { getProfileInfo } from '@/api/auth'
import { clearAccessToken, getAccessToken } from '@/utils/auth'
import { formatDate } from '@/utils/format'

export default {
  name: 'ArticleDetail',
  components: {
    AppSidebar,
    CommentLoginDialog
  },
  data () {
    return {
      article: null,
      comments: [],
      loading: false,
      commentLoading: false,
      submitting: false,
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea0722f.png',
      isLoggedIn: false,
      userInfo: null,
      loginDialogVisible: false,
      commentForm: {
        content: '',
        articleId: null,
        parentId: null,
        replyToId: null
      },
      commentRules: {
        content: [
          { required: true, message: '请输入评论内容', trigger: 'blur' },
          { min: 2, message: '评论不少于2个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    articleTagList () {
      if (!this.article) {
        return []
      }
      if (Array.isArray(this.article.tagList)) {
        return this.article.tagList
      }
      if (Array.isArray(this.article.tags)) {
        return this.article.tags
      }
      return []
    }
  },
  created () {
    this.initAuthStatus()
    this.fetchDetail()
    this.fetchComments()
  },
  methods: {
    formatDate,
    async initAuthStatus () {
      const token = getAccessToken()
      if (!token) {
        this.isLoggedIn = false
        this.userInfo = null
        return
      }
      try {
        const res = await getProfileInfo()
        this.userInfo = (res && res.data) ? res.data : res
        this.isLoggedIn = true
      } catch (e) {
        clearAccessToken()
        this.isLoggedIn = false
        this.userInfo = null
      }
    },
    openLoginDialog () {
      this.loginDialogVisible = true
    },
    handleLoginSuccess ({ userInfo }) {
      this.userInfo = userInfo || null
      this.isLoggedIn = true
      this.loginDialogVisible = false
    },
    async fetchDetail () {
      this.loading = true
      try {
        const res = await getArticleDetail(this.$route.params.id)
        this.article = (res && res.data) ? res.data : res
      } catch (e) {
        this.article = null
      } finally {
        this.loading = false
      }
    },
    async fetchComments () {
      this.commentLoading = true
      try {
        const res = await getComments(this.$route.params.id)
        this.comments = (res && res.data) ? res.data : (Array.isArray(res) ? res : [])
      } catch (e) {
        this.comments = []
      } finally {
        this.commentLoading = false
      }
    },
    submitComment () {
      if (!this.isLoggedIn) {
        this.openLoginDialog()
        return
      }
      this.$refs.commentForm.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          const payload = {
            articleId: Number(this.$route.params.id),
            content: this.commentForm.content,
            parentId: this.commentForm.parentId,
            replyToId: this.commentForm.replyToId
          }
          await addComment(payload)
          this.$message.success('评论提交成功，审核通过后将显示')
          this.commentForm.content = ''
          this.$refs.commentForm.resetFields()
          this.fetchComments()
        } catch (e) {
          const msg = e && e.message ? e.message : ''
          if (msg.includes('请先登录') || msg.includes('未登录')) {
            clearAccessToken()
            this.isLoggedIn = false
            this.userInfo = null
            this.openLoginDialog()
          }
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-detail {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px;
}
.page-inner {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}
.article-main {
  border-radius: 8px;
  margin-bottom: 24px;
  .cover {
    margin: -20px -20px 24px;
    max-height: 400px;
    overflow: hidden;
    img {
      width: 100%;
      object-fit: cover;
    }
  }
  .article-title {
    font-size: 26px;
    font-weight: 700;
    color: #303133;
    margin: 0 0 16px;
    line-height: 1.4;
  }
  .article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 13px;
    color: #909399;
    margin-bottom: 16px;
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      a { color: #909399; text-decoration: none; &:hover { color: #409EFF; } }
    }
  }
  .article-tags { margin-bottom: 24px; }
  .article-body {
    border-top: 1px solid #f0f0f0;
    padding-top: 24px;
    // 覆盖 mavon-editor 的默认样式让它看起来像纯预览
    :deep(.v-note-wrapper) {
      border: none !important;
      box-shadow: none !important;
      min-height: unset !important;
    }
    :deep(.v-note-show) {
      padding: 0 !important;
    }
  }
}
.comment-section {
  border-radius: 8px;
  .comment-header {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}
.comment-item {
  margin-bottom: 20px;
  .comment-author {
    display: flex;
    gap: 12px;
  }
  .comment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    &.small { width: 28px; height: 28px; }
  }
  .comment-content { flex: 1; }
  .comment-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
    .author-name { font-size: 14px; font-weight: 600; color: #303133; }
    .comment-time { font-size: 12px; color: #c0c4cc; }
  }
  .comment-text {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin: 0;
  }
  .child-comments {
    margin-top: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    .comment-item { margin-bottom: 12px; &:last-child { margin-bottom: 0; } }
  }
}
.comment-form {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  .form-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
  }

  .comment-login-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f8fafc;

    p {
      margin: 0;
      color: #475569;
      font-size: 14px;
    }
  }
}
@media (max-width: 800px) {
  .page-inner { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
</style>
