<template>
  <div class="notification-center">
    <div class="header">
      <h3>{{ $t('notificationCenter.title') }}</h3>
      <div class="actions">
        <el-badge :value="unreadCount" :max="99" class="badge">
          <el-button type="primary" size="small" @click="markAllAsRead">
            {{ $t('notificationCenter.markAllRead') }}
          </el-button>
        </el-badge>
      </div>
    </div>

    <div class="filter-tabs">
      <el-button
        v-for="tab in tabs"
        :key="tab.value"
        :type="activeTab === tab.value ? 'primary' : 'default'"
        size="small"
        @click="activeTab = tab.value"
      >
        {{ $t(tab.label) }}
      </el-button>
    </div>

    <div class="notification-list" v-loading="loading">
      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <el-empty :description="$t('notificationCenter.noNotifications')" />
      </div>

      <div v-else class="list-container">
        <NotificationCard
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :notification="notification"
          @click="handleNotificationClick(notification)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';
import { useUserStore } from '@/stores/userStore';
import NotificationCard from './notificationsCard.vue';
import { ElMessage } from 'element-plus';

const notificationStore = useNotificationStore();
const userStore = useUserStore();

const loading = ref(false);
const activeTab = ref('all');

const tabs = [
  { value: 'all', label: 'notificationCenter.all' },
  { value: 'unread', label: 'notificationCenter.unread' },
  { value: 'project_invite', label: 'notificationCenter.invites' },
  { value: 'document_upload', label: 'notificationCenter.documents' },
  { value: 'task_assigned', label: 'notificationCenter.tasks' }
];

const unreadCount = computed(() => notificationStore.unreadCount);

const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notificationStore.notifications.filter(n => !n.is_read);
    case 'project_invite':
    case 'document_upload':
    case 'task_assigned':
      return notificationStore.notifications.filter(n => n.type === activeTab.value);
    default:
      return notificationStore.notifications;
  }
});

const fetchNotifications = async () => {
  if (!userStore.user?.id) return;
  
  loading.value = true;
  try {
    await notificationStore.fetchNotifications(userStore.user.id);
  } catch (error) {
    ElMessage.error('获取通知失败');
  } finally {
    loading.value = false;
  }
};

const markAllAsRead = async () => {
  if (!userStore.user?.id) return;
  
  try {
    await notificationStore.markAllAsRead(userStore.user.id);
    ElMessage.success('已标记所有通知为已读');
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const handleNotificationClick = (notification: any) => {
  // 标记为已读
  if (!notification.is_read) {
    notificationStore.markAsRead(notification.id);
  }

  // 根据通知类型跳转
  switch (notification.type) {
    case 'project_invite':
      // 跳转到项目
      if (notification.project_id) {
        // router.push(`/projects/${notification.project_id}`);
      }
      break;
    case 'document_upload':
      // 跳转到文档
      if (notification.document_id) {
        // router.push(`/documents/${notification.document_id}`);
      }
      break;
    case 'task_assigned':
      // 跳转到任务
      if (notification.task_id) {
        // router.push(`/tasks/${notification.task_id}`);
      }
      break;
  }
};

onMounted(() => {
  fetchNotifications();
  notificationStore.requestNotificationPermission();
});
</script>

<style scoped lang="scss">
.notification-center {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.actions {
  .badge {
    margin-right: 8px;
  }
}

.filter-tabs {
  padding: 12px 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  gap: 8px;

  .el-button {
    font-size: 12px;
  }
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

  .list-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

/* 滚动条样式 */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}
</style>
