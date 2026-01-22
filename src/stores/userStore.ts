import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import user1 from "@/assets/pics/用户头像.jpg";
import user2 from "@/assets/pics/用户2.jpg";
import user3 from "@/assets/pics/用户3.jpg";
import user4 from "@/assets/pics/用户4.jpg";

export interface UserItem {
  name: string;
  email: string;
  status: string;
  postion: string;
  percentage: number;
  pic: string;
  userId: string;
  tags: string[];
  signature: string;
  role: string;
}

export const useUserStore = defineStore("users", () => {
  const user = reactive<UserItem>({
    name: "Kevin",
    email: "Kevin@163.com",
    status: "online",
    postion: "Front-end Lead",
    percentage: 60,
    pic: user1,
    userId: "202601051",
    tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
    signature: "前端技术专家，专注于前端技术，热爱开源，喜欢分享技术文章",
    role: "admin"
  });
  const usersTable: UserItem[] = [
    {
      name: "Kevin",
      email: "Kevin@163.com",
      status: "online",
      postion: "Front-end Lead",
      percentage: 60,
      pic: user1,
      userId: "202601051",
      tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
      signature: "前端技术专家，专注于前端技术，热爱开源，喜欢分享技术文章",
      role: "admin",
    },
    {
      name: "Sarah Jenkins",
      email: "Sarah@163.com",
      status: "online",
      postion: "Backend Lead",
      percentage: 30,
      pic: user2,
      userId: "202601053",
      tags: ["Java", "SpringBoot", "MySQL"],
      signature: "后端技术专家，专注于后端技术，热爱开源，喜欢分享技术文章",
      role: "viewer",
    },
    {
      name: "David Kim",
      email: "David@163.com",
      status: "online",
      postion: "UI Designer",
      percentage: 90,
      pic: user3,
      userId: "202601054",
      tags: ["Figma"],
      signature: "UI设计师，专注于UI设计，热爱开源，喜欢分享技术文章",
      role: "manager",
    },
    {
      name: "Mike Ross",
      email: "Mike@163.com",
      status: "offline",
      postion: "DevOps",
      percentage: 50,
      pic: user4,
      userId: "202601055",
      tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
      signature: "DevOps工程师，专注于DevOps技术，热爱开源，喜欢分享技术文章",
      role: "contributor",
    },
  ];

  return { usersTable, user };
});
