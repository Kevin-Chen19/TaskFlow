import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import user1 from "@/assets/pics/用户头像.jpg";
import user2 from "@/assets/pics/用户2.jpg";
import user3 from "@/assets/pics/用户3.jpg";
import user4 from "@/assets/pics/用户4.jpg";
export const useUserStore = defineStore('users', () => {
  const usersTable = [
  {
    name: "Kevin",
    postion: "Frontend Lead",
    percentage: 60,
    pic: user1,
    userId:1
  },
  {
    name: "Sarah Jenkins",
    postion: "Backend Lead",
    percentage: 30,
    pic: user2,
    userId:2
  },
  {
    name: "David Kim",
    postion: "UI Designer",
    percentage: 90,
    pic: user3,
    userId:3
  },
  {
    name: "Mike Ross",
    postion: "DevOps",
    percentage: 50,
    pic: user4,
    userId:4
  }
]

  return { usersTable }
})
