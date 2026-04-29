<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('Dashboard.activityLog')"
    width="900"
    align-center
    class="activity-log-dialog"
    :close-on-click-modal="true"
  >
    <div class="dialog-subtitle">{{ $t('Dashboard.activityLogSubtitle') }}</div>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-box">
        <el-icon class="search-icon"><Search /></el-icon>
        <el-input
          v-model="searchQuery"
          :placeholder="$t('Dashboard.searchActivity')"
          class="search-input"
          clearable
        />
      </div>
      <div class="toolbar-actions">
        <el-button class="toolbar-btn">
          <el-icon><Download /></el-icon>
          {{ $t('Dashboard.export') }}
        </el-button>
      </div>
    </div>

    <!-- 活动列表 -->
    <div class="activity-list" v-loading="loading">
      <table class="activity-table">
        <thead>
          <tr>
            <th class="col-activity">{{ $t('Dashboard.activity') }}</th>
            <th class="col-date">{{ $t('Dashboard.date') }}</th>
            <th class="col-performer">{{ $t('Dashboard.performer') }}</th>
            <th class="col-category">{{ $t('Dashboard.category') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in activities"
            :key="item.id"
            :class="{ 'row-alt': index % 2 === 1 }"
          >
            <td class="col-activity">
              <div class="activity-info">
                <div class="activity-icon" :class="`icon-${item.category}`">
                  <el-icon>
                    <component :is="getActivityIcon(item.category)" />
                  </el-icon>
                </div>
                <div class="activity-text">
                  <div class="activity-title">{{ item.title }}</div>
                  <div class="activity-desc">{{ item.description }}</div>
                </div>
              </div>
            </td>
            <td class="col-date">{{ formatDate(item.created_at) }}</td>
            <td class="col-performer">
              <div class="performer-info">
                <span class="performer-name">{{ item.performer_name || 'System' }}</span>
              </div>
            </td>
            <td class="col-category">
              <span class="category-tag" :class="`tag-${item.category}`">
                {{ getCategoryLabel(item.category) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 空状态 -->
      <div v-if="!loading && activities.length === 0" class="empty-state">
        <el-empty :description="$t('Dashboard.noActivityLogs')" />
      </div>
    </div>

    <!-- 底部 -->
    <div class="dialog-footer-custom">
      <span class="showing-text">
        {{ $t('Dashboard.showingActivities', { current: activities.length, total: total }) }}
      </span>
      <div class="footer-actions">
        <el-button @click="dialogVisible = false" class="cancel-btn">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" class="load-more-btn">
          {{ $t('Dashboard.loadMore') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
  Search,
  Download,
  UserFilled,
  Lock,
  Refresh,
  CircleCheck,
  User,
  Briefcase,
  Setting,
  Document,
  Folder
} from '@element-plus/icons-vue';
import { getActivityLogs } from '@/api';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  projectId: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const searchQuery = ref('');
const loading = ref(false);
const activities = ref<ActivityItem[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(20);

// 活动类型
interface ActivityItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  performer_name: string;
  performer_avatar?: string;
  category: 'member' | 'role' | 'permission' | 'status' | 'milestone' | 'position' | 'file';
}

// 加载活动日志
const loadActivityLogs = async () => {
  if (!props.projectId) return;
  
  loading.value = true;
  try {
    const res = await getActivityLogs({
      project_id: props.projectId,
      search: searchQuery.value || undefined,
      page: page.value,
      limit: limit.value
    });
    
    if (res.success && res.data) {
      activities.value = res.data;
      total.value = (res as any).pagination?.total || 0;
    }
  } catch (error) {
    console.error('加载活动日志失败:', error);
    ElMessage.error('加载活动日志失败');
  } finally {
    loading.value = false;
  }
};

// 监听弹窗打开时加载数据
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.projectId) {
    loadActivityLogs();
  }
});

// 监听搜索词变化
watch(searchQuery, () => {
  page.value = 1;
  loadActivityLogs();
});



// 获取活动图标
const getActivityIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    member: UserFilled,
    role: Setting,
    permission: Lock,
    status: Refresh,
    milestone: CircleCheck,
    position: Briefcase,
    file: Document
  };
  return iconMap[category] || User;
};

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    member: t('Dashboard.categoryLabel.member'),
    role: t('Dashboard.categoryLabel.role'),
    permission: t('Dashboard.categoryLabel.permission'),
    status: t('Dashboard.categoryLabel.status'),
    milestone: t('Dashboard.categoryLabel.milestone'),
    position: t('Dashboard.categoryLabel.position'),
    file: t('Dashboard.categoryLabel.file')
  };
  return labelMap[category] || category;
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取姓名首字母
const getInitials = (name: string) => {
  return name.charAt(0).toUpperCase();
};
</script>

<style scoped lang="scss">
.activity-log-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px 24px 8px;
    border-bottom: none;
  }

  :deep(.el-dialog__title) {
    font-size: 20px;
    font-weight: 600;
    color: #191b25;
  }

  :deep(.el-dialog__body) {
    padding: 0 24px 20px;
  }

  :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 24px;
  }
}

.dialog-subtitle {
  font-size: 14px;
  color: #747688;
  margin-bottom: 16px;
  margin-top: -8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e1ef;
  margin-bottom: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 320px;
  background: #f3f2ff;
  border-radius: 8px;
  padding: 0 12px;

  .search-icon {
    color: #747688;
    font-size: 16px;
  }

  .search-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none;
      border: none;
      padding: 8px 0;
    }

    :deep(.el-input__inner) {
      font-size: 14px;
      color: #191b25;

      &::placeholder {
        color: #747688;
      }
    }
  }
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e2e1ef;
  border-radius: 8px;
  background: #fff;
  color: #747688;
  font-size: 13px;
  font-weight: 500;

  &:hover {
    background: #edecfb;
    color: #191b25;
  }

  .el-icon {
    font-size: 16px;
  }
}

.activity-list {
  max-height: 400px;
  overflow: auto;
  border-radius: 0 0 8px 8px;
}

.activity-table {
  width: auto;
  min-width: 100%;
  border-collapse: collapse;
  table-layout: auto;

  thead {
    position: sticky;
    top: 0;
    background: #f3f2ff;
    z-index: 1;
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #747688;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e1ef;
    white-space: nowrap;
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #e2e1ef;
    vertical-align: middle;
    white-space: nowrap;
  }

  tbody tr {
    transition: background 0.2s;

    &:hover {
      background: #fbf8ff;
    }

    &.row-alt {
      background: rgba(243, 242, 255, 0.3);

      &:hover {
        background: #fbf8ff;
      }
    }
  }
}

.col-activity {
  min-width: 300px;
}

.col-date {
  min-width: 150px;
}

.col-performer {
  min-width: 120px;
}

.col-category {
  min-width: 100px;
}

.activity-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 18px;
  }

  &.icon-member {
    background: #d5e3fc;
    color: #515f74;
  }

  &.icon-role {
    background: #dee1ff;
    color: #0037d0;
  }

  &.icon-permission {
    background: #ffdad6;
    color: #ba1a1a;
  }

  &.icon-status {
    background: #ffdbd1;
    color: #912400;
  }

  &.icon-milestone {
    background: #e8e7f5;
    color: #434656;
  }

  &.icon-position {
    background: #b9c7df;
    color: #3a485b;
  }

  &.icon-file {
    background: #e3f2fd;
    color: #1976d2;
  }
}

.activity-text {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #191b25;
  margin-bottom: 4px;
  white-space: nowrap;
}

.activity-desc {
  font-size: 12px;
  color: #747688;
  white-space: nowrap;
}

.col-date {
  font-size: 14px;
  color: #747688;
}

.performer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.performer-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;

  &.avatar-placeholder {
    background: #b9c3ff;
    color: #001258;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
  }
}

.performer-name {
  font-size: 14px;
  color: #191b25;
  white-space: nowrap;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;

  &.tag-member {
    background: #d5e3fc;
    color: #515f74;
  }

  &.tag-role {
    background: rgba(222, 225, 255, 0.5);
    color: #0037d0;
  }

  &.tag-permission {
    background: #ffdad6;
    color: #93000a;
  }

  &.tag-status {
    background: rgba(255, 219, 209, 0.3);
    color: #912400;
  }

  &.tag-milestone {
    background: rgba(187, 195, 255, 0.3);
    color: #434656;
  }

  &.tag-position {
    background: rgba(185, 199, 223, 0.5);
    color: #3a485b;
  }

  &.tag-file {
    background: rgba(227, 242, 253, 0.8);
    color: #1976d2;
  }
}

.dialog-footer-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0;
  border-top: 1px solid #e2e1ef;
  margin-top: 0;
}

.showing-text {
  font-size: 12px;
  color: #747688;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #e2e1ef;
  border-radius: 8px;
  background: #fff;
  color: #191b25;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #edecfb;
  }
}

.load-more-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: #0037d0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border: none;

  &:hover {
    background: #1b4dff;
  }
}

.empty-state {
  padding: 40px 0;
}

</style>
