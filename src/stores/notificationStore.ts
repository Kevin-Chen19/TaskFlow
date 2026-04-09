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
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.is_read).length
  );

  // 获取通知列表
  const fetchNotifications = async (receiverId: number, isRead?: boolean) => {
    try {
      const params = new URLSearchParams();
      params.append('receiver_id', receiverId.toString());
      if (isRead !== undefined) {
        params.append('is_read', isRead.toString());
      }

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        notifications.value = result.data;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

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
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission
  };
});
