import { ref, computed } from "vue";
import { defineStore } from "pinia";
import user1 from "@/assets/pics/用户头像.jpg";
import user2 from "@/assets/pics/用户2.jpg";
import user3 from "@/assets/pics/用户3.jpg";
import user4 from "@/assets/pics/用户4.jpg";

export interface UserItem {
  id: number;
  name: string;
  email: string;
  status: string;
  postion: string;
  percentage: number;
  pic: string;
  userId: number;
  tags: string[];
  signature: string;
  role: string;
}

export const useUserStore = defineStore("users", () => {
  const usersTable: UserItem[] = [
    {
      id: 1,
      name: "Kevin",
      email: "Kevin@163.com",
      status: "online",
      postion: "Front-end Lead",
      percentage: 60,
      pic: user1,
      userId: 1,
      tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
      signature: "前端技术专家，专注于前端技术，热爱开源，喜欢分享技术文章",
      role: "admin",
    },
    {
      id: 2,
      name: "Sarah Jenkins",
      email: "Sarah@163.com",
      status: "online",
      postion: "Backend Lead",
      percentage: 30,
      pic: user2,
      userId: 2,
      tags: ["Java", "SpringBoot", "MySQL"],
      signature: "后端技术专家，专注于后端技术，热爱开源，喜欢分享技术文章",
      role: "viewer",
    },
    {
      id: 3,
      name: "David Kim",
      email: "David@163.com",
      status: "online",
      postion: "UI Designer",
      percentage: 90,
      pic: user3,
      userId: 3,
      tags: ["Figma"],
      signature: "UI设计师，专注于UI设计，热爱开源，喜欢分享技术文章",
      role: "manager",
    },
    {
      id: 4,
      name: "Mike Ross",
      email: "Mike@163.com",
      status: "offline",
      postion: "DevOps",
      percentage: 50,
      pic: user4,
      userId: 4,
      tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
      signature: "DevOps工程师，专注于DevOps技术，热爱开源，喜欢分享技术文章",
      role: "contributor",
    },
  ];

  return { usersTable };
});
