<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="topLine">
          <div class="title">
            <div class="logo">
              <img src="@/assets/icons/项目管理.png" alt="Logo" />
            </div>
            Task Flow
          </div>
          <div class="flex-1">
            <div class="ProjectData">
              <span style="color: gray; margin-right: 1rem"
                >Current Project</span
              >
              <span style="color: gray; margin-right: 1rem">/</span>
              <span style="font-weight: 500">项目管理平台PC端</span>
            </div>
            <div style="display: flex; align-items: center">
              <div
                class="notifyStyle"
                @click="
                  getNotifications();
                  showNotifications = true;
                "
              >
                <img src="../../assets/icons/通知.png" alt="通知图标" />
                <div v-show="ifHasUnread" class="point"></div>
              </div>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Open user navigation menu"
                placement="bottom"
              >
                <div style="position: relative">
                  <div class="notifyStyle userPic" @click="showMenu">
                    <img :src="userStore.user.pic" alt="用户头像" />
                  </div>
                </div>
              </el-tooltip>
              <div class="userMenu" v-if="showMenuValue">
                <div class="menuTop">
                  <div
                    class="notifyStyle userPic"
                    style="width: 3vh; height: 3vh"
                  >
                    <img :src="userStore.user.pic" alt="用户头像" />
                  </div>
                  <div style="display: flex; flex-direction: column">
                    <span>{{ userStore.user.name }}</span>
                    <span style="color: gray; font-size: small">{{
                      userStore.user.email
                    }}</span>
                  </div>
                  <div class="closeBtn" @click="showMenuValue = false">
                    <Close />
                  </div>
                </div>
                <div class="signoutBox" @click="signOut">
                  <img src="@/assets/icons/退出登录.png" alt="退出登录图标" />
                  <span>Sign out</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="13vw">
          <div
            class="leftItem"
            @click="changePage('dashboard')"
            :class="which === 'dashboard' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/看板1.png" alt="看板1图标" />
            <div>Dashboard</div>
          </div>
          <div
            class="leftItem"
            @click="changePage('projects')"
            :class="which === 'projects' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/文件1.png" alt="文件1图标" />
            <div class="itemName">Projects</div>
          </div>
          <div
            class="leftItem"
            @click="changePage('tasks')"
            :class="which === 'tasks' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/任务1.png" alt="任务1图标" />
            <div class="itemName">Tasks</div>
          </div>
          <div
            class="leftItem"
            @click="changePage('calendar')"
            :class="which === 'calendar' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/日历栏.png" alt="日历栏图标" />
            <div class="itemName">Calendar</div>
          </div>
          <div
            class="leftItem"
            @click="changePage('team')"
            :class="which === 'team' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/团队1.png" alt="团队1图标" />
            <div class="itemName">Team</div>
          </div>
          <div
            class="leftItem"
            @click="changePage('roles')"
            :class="which === 'roles' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/权限设置.png" alt="权限设置图标" />
            <div class="itemName">Roles</div>
          </div>
          <div
            class="leftItem"
            @click="changePage('me')"
            :class="which === 'me' ? 'leftChoose' : ''"
          >
            <img src="../../assets/icons/我的.png" alt="我的图标" />
            <div class="itemName">Me</div>
          </div>
        </el-aside>
        <el-container>
          <el-main>
            <div class="mainBox">
              <router-view></router-view>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
  <el-drawer
    v-model="showNotifications"
    :modal="false"
    :modal-penetrable="true"
    :close-on-click-modal="true"
    :direction="direction"
    :before-close="handleClose"
    :size="drawerWidth"
  >
    <template #header="">
      <div class="NotificationsTop">
        <div class="Icon_Name">
          <img src="@/assets/icons/通知提醒.png" alt="通知提醒图标" />
          <span class="NotiTitle">Notifications</span>
        </div>
        <div class="Mark" @click="handleMarkAllRead">Mark all read</div>
      </div>
    </template>
    <div class="MessageBox">
      <div v-for="(item, index) in notificationsByDate" :key="index">
        <div class="TimeTile">
          <div>{{ getDateTip(item.date) }}</div>
          <div class="longLine"></div>
        </div>
        <div v-for="littleItem in item.notifications">
          <NotificationsCard
            :notification="littleItem"
            @mark-as-read="handleMarkRead"
          />
        </div>
      </div>
      <div class="moreBtn">View more Notifications</div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import NotificationsCard from "@/components/NotificationsCard.vue";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUserStore } from "@/stores/userStore";
import { Close } from "@element-plus/icons-vue";
const notificationStore = useNotificationStore();
const which = ref("dashboard");
const showNotifications = ref(false);
const userStore = useUserStore();
const showMenuValue = ref(false);
const windowWidth = ref(window.innerWidth);
const direction = ref("rtl");
const router = useRouter();
const todayDate = ref("");
const yesterdayDate = ref("");
const notificationsByDate = reactive([]);
const changePage = (name: string) => {
  which.value = name;
  router.push({
    path: `/${name}`,
  });
};
const handleClose = () => {
  showNotifications.value = false;
};
const drawerWidth = computed(() => {
  if (windowWidth.value < 1500) {
    return "25rem"; // 平板
  } else {
    return "23%"; // 桌面
  }
});
const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
const ifHasUnread = computed(() => {
  return notificationsByDate.some((dateItem) => {
    return dateItem.notifications.some((item) => {
      return item.status === "未读";
    });
  });
});
onMounted(() => {
  getNotifications();
});
const signOut = () => {
  //路由重定向到login界面
  router.push({
    path: "/",
  });
};
//刷新通知的函数
const getNotifications = () => {
  notificationsByDate.splice(0, notificationsByDate.length); //清空数据
  const currentDateTime = getCurrentDateTime();
  todayDate.value = currentDateTime.split(" ")[0];
  yesterdayDate.value = new Date(
    new Date(currentDateTime).getTime() - 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];
  let curentDate = "";
  let datejih = {
    date: curentDate,
    notifications: [],
  };
  let num = 0;
  for (let item of notificationStore.notifications) {
    let splitDate = item.time.split(" ")[0];
    if (curentDate === splitDate) {
      datejih.notifications.push(item);
    } else {
      if (curentDate !== "") {
        notificationsByDate.push(datejih);
      }
      curentDate = splitDate;
      datejih = {
        date: curentDate,
        notifications: [],
      };
      datejih.notifications.push(item);
      if (num === notificationStore.notifications.length - 1) {
        notificationsByDate.push(datejih);
      }
    }
    num++;
  }
};
const getDateTip = (dateValue: string): string => {
  if (dateValue === todayDate.value) {
    return "TODAY";
  } else if (dateValue === yesterdayDate.value) {
    return "YESTERDAY";
  } else {
    return dateValue;
  }
};
const MarkRead = (type: string, id: string, ifAll: boolean) => {
  if (ifAll) {
    notificationsByDate.forEach((dateItem) => {
      dateItem.notifications.forEach((item) => {
        item.status = "已读";
      });
    });
  } else {
    let breakFlag = false;
    notificationsByDate.forEach((dateItem) => {
      if (breakFlag) {
        return;
      }
      dateItem.notifications.forEach((item) => {
        if (item.id === id) {
          item.status = "已读";
          breakFlag = true;
          return;
        }
      });
    });
  }
};

const handleMarkAllRead = () => {
  MarkRead("", "", true);
};

const handleMarkRead = (id: string) => {
  MarkRead("", id, false);
};
const showMenu = () => {
  showMenuValue.value = !showMenuValue.value;
};
</script>
<style scoped lang="scss">
.el-header,
.el-aside,
.el-main {
  padding: 0;
  margin: 0;
}
:deep().el-header {
  height: 7vh;
}
:deep().el-aside {
  height: 93vh;
  background-color: #fff;
}
.logo {
  width: 3rem;
  height: 3rem;
  background-color: #1193d4;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  margin-right: 1rem;
  img {
    width: 70%;
  }
}
.title {
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
}
.topLine {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background-color: #c9e9f3cc;
}
.ProjectData {
  margin-left: 4.6rem;
  height: 5rem;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  font-size: 1.2rem;
  border-left: 2px solid #fff;
}
.flex-1 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
:deep().el-input__wrapper {
  width: 17vw;
  height: 3.5vh;
  border-radius: 1vw;
  background-color: #eff0f1;
  font-size: medium;
}
.notifyStyle {
  position: relative;
  margin-left: 10px;
  width: 3vh;
  height: 3vh;
  background-color: #eff0f1;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0; // 不收缩,防止被自适应宽度的input压缩
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 50%;
  }
}
.userPic {
  width: 5vh;
  height: 5vh;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.userMenu {
  position: absolute;
  width: 15rem;
  border: 1px solid #aeadad;
  right: 1rem;
  top: 6.5vh;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 0.5rem;
}
.menuTop {
  display: flex;
  padding-bottom: 1rem;
  border-bottom: 1px solid #aeadad;
}
.signoutBox {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    height: 1.2rem;
    margin-right: 0.5rem;
  }
  font-size: 1rem;
}
.closeBtn {
  position: absolute;
  right: 1rem;
  width: 1rem;
  cursor: pointer;
}
.leftBox {
  background-color: #fff;
}
.mainBox {
  height: 93vh;
  background-color: #eaeef1;
}
.leftItem {
  box-sizing: border-box;
  height: 5vh;
  width: 90%;
  margin-left: 5%;
  margin-top: 5px;
  background-color: #fff;
  color: #979aa1;
  border-radius: 1.5vh;
  display: flex;
  align-items: center;
  padding: 0 6%;
  font-weight: 500;
  cursor: pointer;
  img {
    width: 1.5vw;
    margin-right: 0.5vw;
  }
}
.leftItem:hover {
  background-color: #c9e9f3cc;
  color: #12a6b1;
}
.leftChoose {
  background-color: #c9e9f3cc;
  color: #12a6b1;
}
.mainBox {
  height: 93vh;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  display: flex;
  justify-content: center;
  align-items: center;
}
.NotificationsTop {
  box-sizing: border-box;
  width: 90%;
  height: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .Icon_Name {
    height: 100%;
    display: flex;
    align-items: center;
    img {
      height: 80%;
    }
    .NotiTitle {
      margin-left: 1rem;
      font-size: 1.2rem;
      font-weight: 600;
    }
  }
  .Mark {
    font-size: 1rem;
    font-weight: 600;
    color: #4d77ea;
    margin-right: 1rem;
    cursor: pointer;
  }
  .Mark:hover {
    //下划线
    text-decoration: underline;
  }
}
.MessageBox {
  width: 100%;
  height: fit-content;
}
.TimeTile {
  width: 100%;
  height: 2rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #7c8d9d;
  .longLine {
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    flex: 1;
    height: 2px;
    background-color: rgb(218, 211, 211);
  }
}
.moreBtn {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
  color: rgb(138, 137, 137);
  cursor: pointer;
}
.moreBtn:hover {
  color: #135bec;
}
</style>
