import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';
import { ElMessage } from 'element-plus';
import { useNotificationStore } from '@/stores/notificationStore';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // 初始化连接
  public connect() {
    const userStore = useUserStore();
    const token = userStore.user.token;

    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    this.socket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.setupEventListeners();
  }

  // 设置事件监听器
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // 加入用户项目房间
      this.socket?.emit('join:projects');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        ElMessage.error('实时通知连接失败，请刷新页面重试');
      }
    });

    this.socket.on('notification:new', (notification) => {
      this.handleNewNotification(notification);
    });

    this.socket.on('notification:read-success', ({ notificationId }) => {
      console.log('Notification marked as read:', notificationId);
    });

    this.socket.on('notification:error', ({ message }) => {
      ElMessage.error(message || 'Notification error');
    });

    // 心跳机制
    setInterval(() => {
      if (this.isConnected) {
        this.socket?.emit('ping');
      }
    }, 30000);
  }

  // 处理新通知
  private handleNewNotification(notification: any) {
    const notificationStore = useNotificationStore();
    
    // 添加到通知列表
    notificationStore.notifications.unshift(notification);
    
    // 更新未读数量
    if (!notification.is_read) {
      notificationStore.unreadCount++;
    }

    // 显示消息提醒
    ElMessage.info({
      message: notification.message,
      duration: 5000,
      showClose: true,
      grouping: true
    });

    // 浏览器通知（如果用户授权）
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.sender_avatar || '/favicon.ico'
      });
    }
  }

  // 加入项目房间
  public joinProject(projectId: number) {
    if (this.socket?.connected) {
      this.socket.emit('join:project', projectId);
    }
  }

  // 离开项目房间
  public leaveProject(projectId: number) {
    if (this.socket?.connected) {
      this.socket.emit('leave:project', projectId);
    }
  }

  // 标记通知为已读
  public markAsRead(notificationId: number) {
    if (this.socket?.connected) {
      this.socket.emit('notification:mark-read', notificationId);
    }
  }

  // 断开连接
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 获取连接状态
  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id
    };
  }
}

// 导出单例实例
export const socketService = new SocketService();
