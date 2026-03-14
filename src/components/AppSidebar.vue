<template>
  <aside class="sidebar">
    <!-- 关于博主 -->
    <el-card class="sidebar-card" shadow="never">
      <div class="author-info">
        <img
          class="avatar"
          :src="configMap.site_avatar || defaultAvatar"
          alt="avatar"
        />
        <p class="author-name">{{ configMap.site_author || '博主' }}</p>
        <p class="author-bio">{{ configMap.site_description || '' }}</p>
      </div>
    </el-card>

    <el-card v-if="configMap.site_notice" class="sidebar-card" shadow="never">
      <div slot="header" class="card-header">
        <i class="el-icon-bell" /> 公告
      </div>
      <p class="site-notice">{{ configMap.site_notice }}</p>
    </el-card>

    <!-- 分类 -->
    <el-card class="sidebar-card" shadow="never">
      <div slot="header" class="card-header">
        <i class="el-icon-folder" /> 分类
      </div>
      <ul class="sidebar-list">
        <li
          v-for="cat in categories"
          :key="cat.id"
          @click="$router.push(`/category/${cat.id}`)"
        >
          <span>{{ cat.name }}</span>
          <el-badge :value="cat.articleCount" type="info" />
        </li>
      </ul>
    </el-card>

    <!-- 标签 -->
    <el-card class="sidebar-card" shadow="never">
      <div slot="header" class="card-header">
        <i class="el-icon-price-tag" /> 标签
      </div>
      <div class="tag-cloud">
        <el-tag
          v-for="tag in tags"
          :key="tag.id"
          size="small"
          type="info"
          @click.native="$router.push(`/tag/${tag.id}`)"
          style="cursor:pointer;margin:4px;"
        >{{ tag.name }}</el-tag>
      </div>
    </el-card>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar',
  data () {
    return {
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea0722f.png'
    }
  },
  computed: {
    configMap () {
      return this.$store.getters.configMap || {}
    },
    categories () {
      return this.$store.getters.categories || []
    },
    tags () {
      return this.$store.getters.tags || []
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  .sidebar-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .card-header {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      i { margin-right: 6px; }
    }
  }

  .author-info {
    text-align: center;
    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 10px;
    }
    .author-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 6px;
      color: #303133;
    }
    .author-bio {
      font-size: 13px;
      color: #909399;
      line-height: 1.5;
      margin: 0;
    }
  }

  .site-notice {
    margin: 0;
    font-size: 13px;
    color: #606266;
    line-height: 1.65;
    white-space: pre-wrap;
  }

  .sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 4px;
      border-bottom: 1px solid #f2f2f2;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
      &:last-child { border-bottom: none; }
      &:hover { color: #409EFF; }
    }
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
