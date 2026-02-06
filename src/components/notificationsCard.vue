<template>
  <div class="contenBox2">
    <div class="picBox">
      <div class="iconBox" :style="{backgroundColor: iconBgc}">
        <img :src="iconPic" alt="消息图标">
        <div class="point" v-show="props.notification?.status === '未读'"></div>
      </div>
    </div>
    <div class="messageBox">
      <div class="messTop">
        <span class="messTitle">{{ props.notification?.name ? $t(props.notification?.name) : '' }}</span>
        <span class="messTime">{{ props.notification?.time?.split(' ')[1] || '' }}</span>
      </div>
      <div class="whoSayBox" v-if="props.notification?.kind === '聊天消息'">
        <span style="color: #135bec; margin-right: 0.4rem;">@{{ props.notification?.creator }}</span>
        <span>{{$t('notificationCard.commented')}}:</span>
      </div>
      <div class="descriptionBox">
        <span>{{  props.notification?.content }}</span>
      </div>
      <div class="messBottom">
        <div class="replyBtn" v-if="props.notification?.kind === '聊天消息'">{{ $t('notificationCard.reply') }}</div>
        <div v-if="props.notification?.status === '未读'" class="MarkBtn" @click="handleMarkRead">{{ $t('notificationCard.markAsRead') }}</div>
        <div v-if="props.notification?.status !== '未读'" class="MarkBtn" @click="handleMarkUnread">{{ $t('notificationCard.markAsUnread') }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { notificationItem } from "@/stores/notificationStore";
import ChatIcon from "@/assets/icons/聊天消息.png";
import FileIcon from "@/assets/icons/文件上传.png";
import TaskIcon from "@/assets/icons/变更.png";
const props = defineProps<{
  notification?: notificationItem;
  markRead?: (id: string) => void;
}>();
const emit = defineEmits<{
  markAsRead: [id: string]
}>();
const iconPic = computed(() => {
  if(props.notification?.kind === "聊天消息"){
    return ChatIcon;
  } else if (props.notification?.kind === "任务提醒" ){
    return TaskIcon;
  } else {
    return FileIcon;
  }
})
const iconBgc = computed(() => {
  if(props.notification?.kind === "聊天消息"){
    return "#eff6ff";
  } else if (props.notification?.kind === "任务提醒" ){

    return "#fff7ed";
  } else {

    return "#faf5ff";
  }
})

const handleMarkRead = () => {
  if (props.notification?.id) {
    emit('markAsRead', props.notification.id);
  }
}

const handleMarkUnread = () => {
  if (props.notification?.id) {
    emit('markAsRead', props.notification.id);
    props.notification.status = '未读';
  }
}
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
}
</style>