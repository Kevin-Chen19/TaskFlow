import { defineStore } from "pinia";

export interface notificationItem {
  id: string;
  name: string; //消息标题
  time: string; //创建时间
  status: string; //消息状态
  creator: string; //创建者
  receiver: string[]; //消息接受者
  kind: string; //消息类型
  content: string; //消息内容
}
export const useNotificationStore = defineStore("notification", () => {
  const notifications: notificationItem[] = [
    {
      id: "202645451",
      name: "聊天信息",
      time: "2026-01-30 16:20:20",
      status: "未读",
      creator: "Sarah",
      receiver: ["Kevin"],
      kind: "聊天消息",
      content: "记得下午2:00有一个小组会议，别忘了带上备忘录记录会议内容.",
    },
    {
      id: "202645452",
      name: "任务提醒",
      time: "2026-01-29 16:22:20",
      status: "未读",
      creator: "Sarah",
      receiver: ["Kevin", "David"],
      kind: "任务提醒",
      content: "完成前端项目需求分析文档.",
    },
    {
      id: "202645454",
      name: "任务提醒",
      time: "2026-01-29 16:25:20",
      status: "未读",
      creator: "Sarah",
      receiver: ["Kevin", "David"],
      kind: "任务提醒",
      content: "完成前端登录页UI设计初稿.",
    },
    {
      id: "202645453",
      name: "文件提醒",
      time: "2026-01-27 16:25:20",
      status: "未读",
      creator: "Sarah",
      receiver: ["Kevin"],
      kind: "文件消息",
      content: "会议记录.docx uploaded to the project folder.",
    },
  ];
  return { notifications };
});
