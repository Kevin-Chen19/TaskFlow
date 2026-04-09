<template>
  <div class="contenBox2" :class="{ unread: !notification.is_read }">
    <div class="picBox">
      <div class="iconBox" :style="{ backgroundColor: iconBgc }">
        <img :src="iconPic" alt="消息图标">
        <div class="point" v-show="!notification.is_read"></div>
      </div>
    </div>
    <div class="messageBox">
      <div class="messTop">
        <span class="messTitle">{{ notification.title }}</span>
        <span class="messTime">{{ formatTime(notification.created_at) }}</span>
      </div>
      <div class="whoSayBox" v-if="notification.sender_name">
        <span style="color: #135bec; margin-right: 0.4rem;">@{{ notification.sender_name }}</span>
      </div>
      <div class="descriptionBox">
        <span>{{ notification.message }}</span>
      </div>
          <div class="messBottom">
        <!-- 项目邀请响应按钮 -->
        <template v-if="notification.type === 'project_invite'">
          <div class="acceptBtn" @click.stop="handleAcceptInvite">
            接受邀请
          </div>
          <div class="rejectBtn" @click.stop="handleRejectInvite">
            拒绝邀请
          </div>
        </template>
        <!-- 其他通知类型的回复按钮 -->
        <div class="replyBtn" v-if="notification.type === 'comment_mention'">
          {{ $t('notificationCard.reply') }}
        </div>
        <div v-if="!notification.is_read" class="MarkBtn" @click="handleMarkRead">
          {{ $t('notificationCard.markAsRead') }}
        </div>
        <div v-else class="MarkBtn" @click="handleMarkUnread">
          {{ $t('notificationCard.markAsUnread') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Notification } from "@/stores/notificationStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { ElMessage } from "element-plus";
import ChatIcon from "@/assets/icons/聊天消息.png";
import FileIcon from "@/assets/icons/文件上传.png";
import TaskIcon from "@/assets/icons/变更.png";
import InviteIcon from "@/assets/icons/变更.png";

const props = defineProps<{ notification: Notification }>();
const emit = defineEmits<{
  (e: 'accept-invite', notification: Notification): void;
  (e: 'reject-invite', notification: Notification): void;
}>();

const notificationStore = useNotificationStore();

const iconPic = computed(() => {
  switch (props.notification.type) {
    case 'comment_mention':
      return ChatIcon;
    case 'document_upload':
      return FileIcon;
    case 'task_assigned':
      return TaskIcon;
    case 'project_invite':
      return InviteIcon;
    default:
      return FileIcon;
  }
});

const iconBgc = computed(() => {
  switch (props.notification.type) {
    case 'comment_mention':
      return "#eff6ff";
    case 'document_upload':
      return "#faf5ff";
    case 'task_assigned':
      return "#fff7ed";
    case 'project_invite':
      return "#fef3c7";
    default:
      return "#f3f4f6";
  }
});

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const handleMarkRead = async () => {
  await notificationStore.markAsRead(props.notification.id);
};

const handleMarkUnread = () => {
  // 标记为未读（可以扩展API支持）
  props.notification.is_read = false;
  props.notification.read_at = undefined;
};

// 接受项目邀请
const handleAcceptInvite = async () => {
  if (!props.notification.project_id) {
    ElMessage.error('项目信息缺失');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const inviteData = props.notification.data ? JSON.parse(props.notification.data) : {};

    const response = await fetch('/api/project-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        project_id: props.notification.project_id,
        user_id: props.notification.receiver_id,
        role: inviteData.role || 'member',
        position: inviteData.position || '',
        is_active: true
      })
    });

    const result = await response.json();

    if (result.success) {
      // 标记通知为已读
      await notificationStore.markAsRead(props.notification.id);
      ElMessage.success('已接受邀请，加入项目成功');
      emit('accept-invite', props.notification);
    } else {
      ElMessage.error(result.message || '接受邀请失败');
    }
  } catch (error) {
    console.error('接受邀请失败:', error);
    ElMessage.error('接受邀请失败，请稍后重试');
  }
};

// 拒绝项目邀请
const handleRejectInvite = async () => {
  // 简单标记为已读即可（不添加到项目成员）
  await notificationStore.markAsRead(props.notification.id);
  ElMessage.info('已拒绝邀请');
  emit('reject-invite', props.notification);
};
</script>

<style scoped lang="scss">
.contenBox2{
  box-sizing: border-box;
  margin-top: 1rem;
  padding: 1rem;
  width: 100%;
  display: flex;
  width: 100%;
  height: fit-content;
  border-radius: 1rem;
  border: 1px solid rgb(218, 211, 211);
  box-shadow: 2px 2px 10px #acb2b7;
}
.contenBox2:hover{
  border-left: 4px solid #135bec;
  box-shadow: 5px 5px 5px #acb2b7;
  .picBox{
    margin-left: -3px;
  }
}
.picBox{
  width: 5rem;
  height:100%;
  display: flex;
  justify-content: center;
  .iconBox{
    position: relative;
    width: 4rem;
    height: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #eff6ff;
    border: 1px solid  rgb(218, 211, 211);
    img{
      width: 50%;
    }
  }
}
.messageBox{
  margin-left: 0.5rem;
  flex: 1;
  color: rgb(138, 137, 137);
}
.messTop{
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.messTitle{
  font-size: 1.2rem;
  font-weight: 600;
  color: black;
}
.whoSayBox{
  font-weight: 500;
  color: rgb(68, 68, 68);
}
.descriptionBox{
  margin-top: 0.5rem;
  width: 100%;
  //文字超出行数省略
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  text-overflow: ellipsis;
}
.messBottom{
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap:1rem;
  .replyBtn{
    padding:0.2rem 0.7rem;
    background-color: #e7eefd;
    border-radius: 0.2rem;
    color:#135bec;
    font-weight: 500;
    cursor: pointer;
  }
  .replyBtn:hover{
    background-color: #135bec;
    color: #fff;
  }
  .MarkBtn{
    font-weight: 500;
    cursor: pointer;
  }
  .MarkBtn:hover{
    color: #135bec;
  }
  .acceptBtn{
    padding: 0.3rem 1rem;
    background-color: #10b981;
    border-radius: 0.3rem;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .acceptBtn:hover{
    background-color: #059669;
  }
  .rejectBtn{
    padding: 0.3rem 1rem;
    background-color: #ef4444;
    border-radius: 0.3rem;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .rejectBtn:hover{
    background-color: #dc2626;
  }
}
</style>