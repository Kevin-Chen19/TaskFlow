import { reactive } from "vue";
import { defineStore } from "pinia";
import user1 from "@/assets/pics/用户头像.jpg";
import user2 from "@/assets/pics/用户2.jpg";
import user3 from "@/assets/pics/用户3.jpg";
import user4 from "@/assets/pics/用户4.jpg";
import { updateUser } from '@/api'
import { useLoginStore } from './loginStore'

export interface UserItem {
  name: string;
  email: string;
  phone: string;
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
  const loginStore = useLoginStore()
  
  // 默认用户数据（用于未登录时的展示）
  const defaultUser: UserItem = {
    name: "Kevin",
    email: "Kevin@163.com",
    phone: "13888888888",
    status: "online",
    postion: "Front-end Lead",
    percentage: 60,
    pic: user1,
    userId: 5,
    tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
    signature: "前端技术专家，专注于前端技术，热爱开源，喜欢分享技术文章",
    role: "Project Manager"
  };

  const user = reactive<UserItem>({ ...defaultUser });
  const usersTable: UserItem[] = [
    {
      name: "Kevin",
      email: "Kevin@163.com",
          phone: "13888888887",
      status: "online",
      postion: "Front-end Lead",
      percentage: 60,
      pic: user1,
      userId: 6,
      tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
      signature: "前端技术专家，专注于前端技术，热爱开源，喜欢分享技术文章",
      role: "Project Manager",
    },
    {
      name: "Sarah Jenkins",
      email: "Sarah@163.com",
          phone: "13888888886",
      status: "online",
      postion: "Backend Lead",
      percentage: 30,
      pic: user2,
      userId: 7,
      tags: ["Java", "SpringBoot", "MySQL"],
      signature: "后端技术专家，专注于后端技术，热爱开源，喜欢分享技术文章",
      role: "viewer",
    },
    {
      name: "David Kim",
      email: "David@163.com",
          phone: "13888888885",
      status: "online",
      postion: "UI Designer",
      percentage: 90,
      pic: user3,
      userId: 8,
      tags: ["Figma"],
      signature: "UI设计师，专注于UI设计，热爱开源，喜欢分享技术文章",
      role: "Contributor",
    },
    {
      name: "Mike Ross",
      email: "Mike@163.com",
          phone: "13888888884",
      status: "offline",
      postion: "DevOps",
      percentage: 50,
      pic: user4,
      userId: 9,
      tags: ["Vue", "React", "node.js", "TypeScript", "Electron"],
      signature: "DevOps工程师，专注于DevOps技术，热爱开源，喜欢分享技术文章",
      role: "contributor",
    },
  ];
  const getUserById = (id: number) => {
    return usersTable.find(user => user.userId === id)
  }
  const getUserNameById = (id: number) => {
    return usersTable.find(user => user.userId === id)?.name
  } 
  // 从后端用户数据转换为前端用户数据格式
  const transformBackendUser = (backendUser: any): UserItem => {
    return {
      name: backendUser.fullname || backendUser.name || defaultUser.name,
      email: backendUser.email || defaultUser.email,
      phone: backendUser.phone || defaultUser.phone,
      status: "online",
      postion: defaultUser.postion,
      percentage: defaultUser.percentage,
      pic: backendUser.avatar_url || defaultUser.pic,
      userId: Number(backendUser.id || defaultUser.userId),
      tags: backendUser.skills || defaultUser.tags,
      signature: backendUser.mooto || defaultUser.signature,
      role: defaultUser.role
    };
  };

  // 更新当前用户信息（从登录状态获取）
  const loadCurrentUser = () => {
    if (loginStore.isLoggedIn && loginStore.user) {
      const transformedUser = transformBackendUser(loginStore.user);
      Object.assign(user, transformedUser);
    }
  };

  const updateUserdata = async (id: number, data: any) => {
   try {
    console.log('更新用户数据:', data);
    const res = await updateUser(id, data);
    if (res.success && res.data) {
      console.log('更新成功:', res.data);
      // 更新本地用户数据
      const transformedUser = transformBackendUser(res.data);
      Object.assign(user, transformedUser);
      
      // 同时更新 loginStore 中的用户信息
      if (loginStore.user) {
        Object.assign(loginStore.user, res.data);
        localStorage.setItem('user', JSON.stringify(loginStore.user));
      }
    }
    return res;
       } catch (error) {
         console.error('更新用户信息失败:', error)
         throw error;
       }
  }

  // 初始化：从登录状态加载用户数据
  const initUser = () => {
    loadCurrentUser();
  };

  return { 
    usersTable, 
    user, 
    getUserById, 
    getUserNameById, 
    updateUserdata,
    initUser
  };
});
