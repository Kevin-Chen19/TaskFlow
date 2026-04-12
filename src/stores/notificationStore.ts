import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { socketService } from "@/services/socketService";
import { ElMessage } from "element-plus";

export interface Notification {
  id: number;
  type: 'project_invite' | 'document_upload' | 'task_assigned' | 'comment_mention' | 'info';
  title: string;
  message: string;
  sender_id: number | null;
  sender_name?: string;
  sender_avatar?: string;
  receiver_id: number;
  project_id?: number;
  document_id?: number;
  task_id?: number;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);
  const totalCount = ref(0);       // 所有通知的总数
  const recentCount = ref(0);       // 最近3天的通知数
  const currentPage = ref(1);
  const pageSize = ref(20);
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.is_read).length
  );

  // 获取通知列表
  const fetchNotifications = async (receiverId: number, isRead?: boolean, page: number = 1, limit: number = 20, append: boolean = false, days: number = 0) => {
    try {
      const params = new URLSearchParams();
      params.append('receiver_id', receiverId.toString());
      if (isRead !== undefined) {
        params.append('is_read', isRead.toString());
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (days > 0) {
        params.append('days', days.toString());
      }

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (append) {
          notifications.value = [...notifications.value, ...result.data];
        } else {
          notifications.value = result.data;
        }
        // 保存最近的总数（用于判断是否有更早期的数据）
        if (days > 0 && page === 1) {
          recentCount.value = result.count || 0;
        }
        // 总数始终是不过滤的总数
        if (days === 0) {
          totalCount.value = result.count || 0;
        }
        currentPage.value = page;
        pageSize.value = limit;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // 加载更多通知（继续加载同一天范围内的数据）
  const loadMoreNotifications = async (receiverId: number) => {
    if (notifications.value.length >= recentCount.value) {
      return; // 当前日期范围内没有更多数据
    }
    await fetchNotifications(receiverId, undefined, currentPage.value + 1, pageSize.value, true as any, 3);
  };

  // 加载更早期的通知（清除日期限制，追加更早期的数据）
  const loadEarlierNotifications = async (receiverId: number) => {
    // 保存当前的通知列表
    const currentNotifications = [...notifications.value];
    const currentIds = new Set(currentNotifications.map(n => n.id));
    
    // 获取所有历史通知（不过滤日期）
    await fetchNotifications(receiverId, undefined, 1, 500, false, 0);
    
    // 过滤出更早期的通知（不在当前显示的通知中的）
    const earlierNotifications = notifications.value.filter(n => !currentIds.has(n.id));
    
    // 合并：当前通知 + 更早期的通知
    notifications.value = [...currentNotifications, ...earlierNotifications];
    
    // 更新总数
    const params = new URLSearchParams();
    params.append('receiver_id', receiverId.toString());
    const response = await fetch(`/api/notifications?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const result = await response.json();
      totalCount.value = result.count || 0;
    }
  };

  // 检查是否还有更早期的数据
  const hasEarlierData = computed(() => {
    return notifications.value.length < totalCount.value;
  });

  // 检查是否还有更多在当前日期范围内的数据
  const hasMoreInRange = computed(() => {
    return notifications.value.length < recentCount.value;
  });

  // 获取未读通知数量
  const fetchUnreadCount = async (receiverId: number) => {
    try {
      const response = await fetch(`/api/notifications/unread-count?receiver_id=${receiverId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // 更新未读数量
        const count = result.data.count;
        const currentUnread = notifications.value.filter(n => !n.is_read).length;
        
        if (count !== currentUnread) {
          // 如果数量不一致，重新获取通知列表
          await fetchNotifications(receiverId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // 创建通知
  const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        notifications.value.unshift(result.data);
        return result.data;
      } else {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      ElMessage.error('发送通知失败');
      throw error;
    }
  };

  // 标记通知为已读
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const index = notifications.value.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          notifications.value[index].is_read = true;
          notifications.value[index].read_at = new Date().toISOString();
        }
        
        // 通过Socket通知服务器
        socketService.markAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async (receiverId: number) => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiver_id: receiverId })
      });

      if (response.ok) {
        notifications.value.forEach(n => {
          if (!n.is_read) {
            n.is_read = true;
            n.read_at = new Date().toISOString();
          }
        });
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 标记通知为未读
  const markAsUnread = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/unread`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const index = notifications.value.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          notifications.value[index].is_read = false;
          notifications.value[index].read_at = undefined;
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  };

  // 删除通知
  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const index = notifications.value.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          notifications.value.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 请求浏览器通知权限
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return {
    notifications,
    totalCount,
    currentPage,
    pageSize,
    unreadCount,
    hasEarlierData,
    hasMoreInRange,
    fetchNotifications,
    loadMoreNotifications,
    loadEarlierNotifications,
    fetchUnreadCount,
    createNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission
  };
});
