<template>
  <div class="bigBox1">
    <div class="userBox">
      <div class="topBox">
        <div class="picBox">
          <div class="picItem">
            <img :src="userStore.user.pic" alt="用户头像" />
          </div>
        </div>
        <div class="editBox" @click="openEditDialog">
          <img src="@/assets/icons/编辑.png" alt="编辑图标" />
        </div>
      </div>
      <div class="nameBox">{{ userStore.user.name }}</div>
      <div class="job_EmailBox">
        {{ userStore.user.postion }} / {{ userStore.user.email }}
      </div>
      <div class="tagsBox">
        <div class="tagItem" v-for="(item, index) in userStore.user.tags">{{ item }}</div>
      </div>
      <div class="juziBox">"{{ userStore.user.signature }}"</div>
    </div>
    <div class="projectsBox">
      <div class="Line_two">
        <div class="TitleBox">
          <div class="iconBox">
            <img src="@/assets/icons/文件夹2.png" alt="文件夹图标" />
          </div>
          <div class="titleName">{{$t('me.Projects')}} | {{$t('me.Created')}}</div>
        </div>
        <div class="btnBox">
          <div
            class="left_rightBtn"
            :style="{ cursor: MyPageNum == 0 ? 'no-drop' : 'pointer' }"
          >
            <img
              src="@/assets/icons/左箭头.png"
              alt="左箭头图标"
              @click="changeShow('my', MyPageNum, 'sub')"
            />
          </div>
          <div
            class="left_rightBtn"
            :style="{
              cursor:
                (MyPageNum + 1) * 3 >= MyProjects.length
                  ? 'no-drop'
                  : 'pointer',
            }"
          >
            <img
              src="@/assets/icons/右箭头.png"
              alt="右箭头图标"
              @click="changeShow('my', MyPageNum, 'add')"
            />
          </div>
        </div>
      </div>
      <div class="cardsBox">
        <div
          class="cardsItem"
          v-for="item in MyProjects.slice(MyPageNum * 3, (MyPageNum + 1) * 3)"
          :key="item.id"
          @click="switchProject(item)"
        >
          <ProjectCard :project="item"></ProjectCard>
        </div>
      </div>
    </div>
    <div class="projectsBox">
      <div class="Line_two">
        <div class="TitleBox">
          <div class="iconBox" style="width: 2rem; height: 2rem">
            <img src="@/assets/icons/加入.png" alt="加入图标" />
          </div>
          <div class="titleName">{{$t('me.Projects')}} | {{$t('me.Joined')}}</div>
        </div>
        <div class="btnBox">
          <div
            class="left_rightBtn"
            :style="{ cursor: JoinPageNum == 0 ? 'no-drop' : 'pointer' }"
          >
            <img
              src="@/assets/icons/左箭头.png"
              alt="左箭头图标"
              @click="changeShow('join', JoinPageNum, 'sub')"
            />
          </div>
          <div
            class="left_rightBtn"
            :style="{
              cursor:
                (JoinPageNum + 1) * 3 >= JoinProjects.length
                  ? 'no-drop'
                  : 'pointer',
            }"
          >
            <img
              src="@/assets/icons/右箭头.png"
              alt="右箭头图标"
              @click="changeShow('join', JoinPageNum, 'add')"
            />
          </div>
        </div>
      </div>
      <div class="cardsBox">
        <div
          class="cardsItem"
          v-for="item in JoinProjects.slice(
            JoinPageNum * 3,
            (JoinPageNum + 1) * 3,
          )"
          :key="item.id"
          @click="switchProject(item)"
        >
          <ProjectCard :project="item"></ProjectCard>
        </div>
      </div>
    </div>
    <div class="projectsBox">
      <div class="TitleBox">
        <div class="iconBox" style="width: 2rem; height: 2rem">
          <img src="@/assets/icons/图表.png" alt="图表图标" />
        </div>
        <div class="titleName">{{ $t('me.PerformanceAnalytics') }}</div>
      </div>
      <div class="analyticsBox">
        <div class="analyticsLeft">
          <div class="Line_two">
            <div>
              <div class="titleName">{{ $t('me.TaskVelocity') }}</div>
              <div class="smallTips">{{ $t('me.Taskscompleteddays') }}</div>
            </div>
            <div class="timeBox">{{ $t('me.Last30Day') }}</div>
          </div>
          <div class="echarsBox">
            <Velocity :data="performanceData.taskVelocity" :labels="performanceData.weekLabels"></Velocity>
          </div>
        </div>
        <div class="analyticsRight">
          <div class="rightItem1">
            <div>
              <div class="smallTips">{{ $t('me.OntimeCompletion') }}</div>
              <div class="rateNumber">{{ performanceData.onTimeRate }}%</div>
            </div>
            <div class="progressBox">
              <el-progress
                type="dashboard"
                :percentage="performanceData.onTimeRate"
                width="70"
                color="#9256f5"
              >
                <template #default="{ percentage }">
                  <span style="font-size: 1.2rem; font-weight: 600">{{ getRateGrade(performanceData.onTimeRate) }}</span>
                </template>
              </el-progress>
            </div>
          </div>
          <div class="rightItem2">
            <div class="Line_two" style="align-items: center">
              <div>
                <div class="smallTips">{{ $t('me.Numberoftasks') }}</div>
                <div class="rateNumber">{{ performanceData.completedTasks }}</div>
              </div>
              <div class="icon_Box">
                <img src="@/assets/icons/闪电.png" alt="闪电图标" />
              </div>
            </div>
            <div class="longBox">
              <el-progress
                :show-text="false"
                :percentage="performanceData.completionRate"
                :stroke-width="16"
                color="#9256f5"
              />
            </div>
            <div class="bottomTip">{{ $t('me.ratereached') }} {{ performanceData.completionRate }}% ({{ performanceData.completedTasks }}/{{ performanceData.totalTasks }})</div>
          </div>
        </div>
      </div>
    </div>
  </div>
   <el-dialog v-model="dialogFormVisible" width="500">
    <template #header>
      <div class="bigTitle">{{ $t('me.EditProfile') }}</div>
      <div class="smallTips">{{ $t('me.UpdateProfile') }}</div>
    </template>
    <div class="contentBox">
      <div class="userPicBox">
        <el-upload
          class="upload-demo"
          :show-file-list="false"
          :on-change="handleAvatarChange"
          :before-upload="beforeAvatarUpload"
          :auto-upload="false"
        >
          <div class="Avatar">
            <img :src="avator == '' ? defaultPic : avator" alt="用户头像" />
          </div>
        </el-upload>
      </div>
      <div class="bigTips">{{ $t('me.ProfilePicture') }}</div>
      <div class="smallTips">{{ $t('me.JPGorPNG') }}</div>
      <div class="formBox">
        <div class="labelName">{{ $t('me.FullName') }}</div>
        <el-input v-model="userForm.fullname" :placeholder="$t('pleaseEnterContent')"></el-input>
        <div class="labelName">{{ $t('me.Position') }}</div>
        <el-input v-model="userStore.user.postion" disabled></el-input>
        <div class="labelName">{{ $t('me.SkillTags') }}</div>
        <el-input-tag
              v-model="userForm.skills"
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              :placeholder="$t('pleaseEnterContent')"
              aria-label="Please click the Enter key after input"
            />
        <div class="labelName">{{ $t('me.EmailAddress') }}</div>
        <el-input v-model="userForm.email" :placeholder="$t('pleaseEnterContent')"></el-input>
        <div class="labelName">{{ $t('team.SIGNATURE') }}</div>
        <el-input v-model="userForm.signature" :placeholder="$t('pleaseEnterContent')"></el-input>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div style="display: flex; justify-content: end;">
          <div class="cancelBtn" @click="dialogFormVisible = false">{{ $t('cancel') }}</div>
          <div class="saveBtn" @click="saveProfile">{{ $t('me.SaveChanges') }}</div>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
//任务完成量折线图；工作按时完成率；工作项数量；工作完成率；
import ProjectCard from "@/components/projectCard.vue";
import Velocity from "@/components/velocity.vue";
import { ref, reactive, onMounted, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useOtherStore } from "@/stores/otherStore";
import { ElMessageBox, ElMessage } from "element-plus";
import { getProjectsByOwner, getProjectsByMember, uploadAvatar, getTasks } from "@/api";
import type { UploadProps } from 'element-plus'
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const { t } = useI18n();
const userStore = useUserStore();
const otherStore = useOtherStore();
const router = useRouter();

// 用户编辑表单数据
const userForm = reactive({
  fullname: "",
  skills: [] as string[],
  email: "",
  signature: "",
});

// 初始化表单数据为当前用户信息
const initUserForm = () => {
  userForm.fullname = userStore.user.name;
  userForm.skills = [...userStore.user.tags];
  userForm.email = userStore.user.email;
  userForm.signature = userStore.user.signature;
};

import defaultAvatarImg from "@/assets/pics/用户头像.jpg";

interface Project {
  id: string;
  creator: string;
  projectName: string;
  description: string;
  percentage: number;
  joinUser: string[];
}
const MyPageNum = ref(0);
const JoinPageNum = ref(0);
const dialogFormVisible = ref(false);
const imageUrl = ref('')
const MyProjects = reactive<Project[]>([]);
const JoinProjects = reactive<Project[]>([]);
const avator = ref('');
const avatorFile = ref<File | null>(null);
const defaultPic = ref(defaultAvatarImg)

// 绩效分析数据
const performanceData = reactive({
  taskVelocity: [0, 0, 0, 0], // 最近4周的任务完成量
  weekLabels: ['Week1', 'Week2', 'Week3', 'Week4'],
  onTimeRate: 0, // 按时完成率
  totalTasks: 0, // 任务总数
  completedTasks: 0, // 已完成任务数
  completionRate: 0 // 完成率
});

// 加载用户项目数据
const loadUserProjects = async () => {
  try {
    const userId = userStore.user.userId;

    // 清空现有数据
    MyProjects.length = 0;
    JoinProjects.length = 0;

    // 获取用户创建的项目
    const myRes = await getProjectsByOwner(userId);
    if (myRes.success && myRes.data) {
      MyProjects.push(...myRes.data.map((item: any) => ({
        id: String(item.id),
        creator: String(item.owner_id),
        projectName: item.name,
        description: item.description || '',
        percentage: item.progress || 0,
        joinUser: []
      })));
    }

    // 获取用户加入的项目
    const joinRes = await getProjectsByMember(userId);
    if (joinRes.success && joinRes.data) {
      JoinProjects.push(...joinRes.data.map((item: any) => ({
        id: String(item.id),
        creator: String(item.owner_id),
        projectName: item.name,
        description: item.description || '',
        percentage: item.progress || 0,
        joinUser: []
      })));
    }
  } catch (error) {
    console.error('加载项目数据失败:', error);
  }
};

onMounted(() => {
  loadUserProjects();
  loadPerformanceData();
});

// 监听项目变化，重新加载绩效数据和项目列表
watch(() => otherStore.projectChangeTrigger, () => {
  loadPerformanceData();
  loadUserProjects();
});

// 计算最近4周的周标签
const getWeekLabels = () => {
  const labels = [];
  const today = new Date();
  for (let i = 3; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    labels.push(`${month}/${day}`);
  }
  return labels;
};

// 获取周的开始日期（周一）
const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 根据按时完成率获取评级
const getRateGrade = (rate: number) => {
  if (rate >= 90) return 'A+';
  if (rate >= 80) return 'A';
  if (rate >= 70) return 'B+';
  if (rate >= 60) return 'B';
  if (rate >= 50) return 'C';
  return 'D';
};

// 加载绩效数据
const loadPerformanceData = async () => {
  try {
    const projectId = otherStore.currentProjectId;
    const userId = userStore.user.userId;
    
    if (!projectId || !userId) {
      console.warn('缺少项目ID或用户ID，无法加载绩效数据');
      return;
    }

    // 获取项目的所有任务
    const res = await getTasks({ project_id: projectId });
    if (!res.success || !res.data) {
      return;
    }

    const tasks = res.data;
    const now = new Date();
    
    // 获取当前用户负责的任务（作为执行者的任务）
    const userTasks = tasks.filter((task: any) => 
      task.assignee_ids && task.assignee_ids.includes(userId)
    );

    // 统计任务总数（只统计负责的任务）
    performanceData.totalTasks = userTasks.length;
    
    // 统计当前用户负责且已完成的任务数（进度100%且是当前用户的任务）
    const completedTasks = userTasks.filter((task: any) => 
      task.progress === 100 && 
      (task.assignee_ids && task.assignee_ids.includes(userId))
    );
    performanceData.completedTasks = completedTasks.length;
    
    // 计算完成率
    performanceData.completionRate = performanceData.totalTasks > 0 
      ? Math.round((performanceData.completedTasks / performanceData.totalTasks) * 100)
      : 0;

    // 计算按时完成率（只统计负责的任务中在截止日期前完成的）
    const tasksWithDueDate = userTasks.filter((task: any) => task.due_date && task.progress === 100);
    const onTimeTasks = tasksWithDueDate.filter((task: any) => {
      // 使用 completed_at 作为完成时间
      const completeTime = task.completed_at || task.updated_at;
      if (!completeTime) return false;
      const completedDate = new Date(completeTime);
      const dueDate = new Date(task.due_date);
      return completedDate <= dueDate;
    });
    
    performanceData.onTimeRate = tasksWithDueDate.length > 0
      ? Math.round((onTimeTasks.length / tasksWithDueDate.length) * 100)
      : 100; // 如果没有设置截止日期的任务，默认为100%

    // 计算最近4周的任务完成量
    const weekData = [0, 0, 0, 0];
    const weekStarts: Date[] = [];
    
    // 获取最近4周的开始日期
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 7);
      weekStarts.push(getWeekStart(date));
    }

    // 统计每周完成的负责的任务数
    const completedUserTasks = userTasks.filter((task: any) => task.progress === 100);
    console.log('已完成的负责任务:', completedUserTasks.length, completedUserTasks);
    
    completedUserTasks.forEach((task: any) => {
      // 优先使用 completed_at 作为完成时间，其次是 updated_at
      const completeTimeField = task.completed_at || task.updated_at;
      if (!completeTimeField) {
        console.log('任务缺少时间字段:', task);
        return;
      }
      
      const completedDate = new Date(completeTimeField);
      console.log('任务完成时间:', task.title, completeTimeField, completedDate);
      
      for (let i = 0; i < 4; i++) {
        const weekStart = weekStarts[i];
        if (!weekStart) continue;
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        if (completedDate >= weekStart && completedDate < weekEnd) {
          weekData[i]++;
          console.log(`任务计入第${i + 1}周:`, weekStart.toLocaleDateString(), '-', weekEnd.toLocaleDateString());
          break;
        }
      }
    });

    performanceData.taskVelocity = weekData;
    performanceData.weekLabels = getWeekLabels();
    
    console.log('绩效数据加载完成:', {
      ...performanceData,
      weekData,
      weekStarts: weekStarts.map(d => d.toLocaleDateString())
    });
  } catch (error) {
    console.error('加载绩效数据失败:', error);
  }
};
const changeShow = (type: string, pageNum: number, action: string) => {
  if (type === "my") {
    let totalPage = Math.ceil(MyProjects.length / 3);
    if (action === "sub") {
      if (pageNum > 0) {
        pageNum--;
      }
    } else {
      if (pageNum < totalPage - 1) {
        pageNum++;
      }
    }
    MyPageNum.value = pageNum;
  } else {
    let totalPage = Math.ceil(JoinProjects.length / 3);
    if (action === "sub") {
      if (pageNum > 0) {
        pageNum--;
      }
    } else {
      if (pageNum < totalPage - 1) {
        pageNum++;
      }
    }
    JoinPageNum.value = pageNum;
  }
};

// 头像文件选择变更并上传
const handleAvatarChange = async (file: any) => {
  // 预览选中的头像
  avator.value = URL.createObjectURL(file.raw);
  avatorFile.value = file.raw;

  // 上传头像到服务器
  try {
    ElMessage.info('正在上传头像...');

    const res: any = await uploadAvatar(userStore.user.userId, file.raw);

    if (res.success && res.data) {
      // 更新头像显示
      avator.value = res.data.avatar_url;
      avatorFile.value = file.raw;

      // 更新本地 store 中的头像
      userStore.user.pic = res.data.avatar_url;

      ElMessage.success('头像上传成功');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败');
  }
}
// 切换项目
const switchProject = (project: Project) => {
  const projectId = Number(project.id);
  const projectName = project.projectName;

  // 判断是否是当前项目
  if (projectId === otherStore.currentProjectId) {
    ElMessage.info(t('me.AlreadyInProject'));
    return;
  }

  // 确认切换
  ElMessageBox.confirm(
    t('me.Areyousureto') + ` "${projectName}" ?`,
    t('me.SwitchProject'),
    {
      confirmButtonText: t('OK'),
      cancelButtonText: t('cancel'),
      type: 'warning'
    }
  ).then(() => {
    // 执行项目切换
    otherStore.setCurrentProject(projectId, projectName);
    ElMessage.success(t('me.SwitchSuccess'));
    // 跳转到项目首页
    router.push('/dashboard');
  }).catch(() => {
    // 取消切换
  });
};

// 打开编辑对话框,初始化表单数据
const openEditDialog = () => {
  initUserForm();
  avator.value = userStore.user.pic;
  dialogFormVisible.value = true;
};
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
const saveProfile = async () => {
  try {
    // 如果有新的头像文件,先上传头像
    if (avatorFile.value && avator.value !== userStore.user.pic) {
      ElMessage.info('正在上传头像...');

      const avatarRes: any = await uploadAvatar(userStore.user.userId, avatorFile.value);

      if (avatarRes.success && avatarRes.data) {
        avator.value = avatarRes.data.avatar_url;
      }
    }

    // 准备要提交的数据
    const updateData: any = {
      fullname: userForm.fullname,
      email: userForm.email,
      skills: userForm.skills,
      mooto: userForm.signature,
    };

    // 如果有新头像 URL,添加到更新数据中
    if (avator.value && avator.value !== userStore.user.pic) {
      updateData.avatar_url = avator.value;
    }

    const userId = userStore.user.userId;
    console.log("保存用户信息:", userId, updateData);

    const res: any = await userStore.updateUserdata(userId, updateData);

    if (res && res.success) {
      ElMessage.success(t('me.SaveChanges') + ' ' + t('success'));
      dialogFormVisible.value = false;

      // 清空头像文件引用
      avatorFile.value = null;
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error(t('me.SaveChanges') + ' ' + t('failed'));
  }
};
</script>
<style scoped lang="scss">
.bigBox1 {
  box-sizing: border-box;
  padding: 1rem 7.5%;
  width: 100%;
  height: 90%;
  overflow: auto;
}
.projectsBox {
  margin-top: 2rem;
}
.userBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.topBox {
  position: relative;
}
.picBox {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .picItem {
    width: 95%;
    height: 95%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    img {
      width: 100%;
    }
  }
}
.editBox {
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #135bec;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  img {
    width: 50%;
  }
}
.nameBox {
  margin-top: 1rem;
  font-size: 2rem;
  font-weight: 600;
}
.job_EmailBox {
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  color: #666666;
}
.tagsBox {
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
}
.tagItem {
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  background-color: #135becb2;
  color: #fff;
  font-size: 0.8rem;
}
.juziBox {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-style: italic;
  font-weight: 400;
}
.TitleBox {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  .iconBox {
    width: 3rem;
    height: 3rem;
    img {
      width: 100%;
    }
  }
}
.titleName {
  font-size: 1.2rem;
  font-weight: 600;
}
.btnBox {
  display: flex;
  gap: 0.5rem;
  .left_rightBtn {
    width: 2rem;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border-radius: 50%;
    border: 1px solid #acacac;
    cursor: pointer;
    img {
      width: 50%;
    }
  }
  .left_rightBtn:hover {
    background-color: #f9f9f9c2;
  }
}
.cardsBox {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 5rem;
}
.cardsItem {
  width: 25rem;
  height: 20rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 5px 5px 10px #00000026;
  cursor: pointer;
}
.cardsItem:hover {
  box-shadow: 10px 10px 10px #00000026;
}
.analyticsBox {
  margin-top: 1rem;
  width: 100%;
  height: 30rem;
  display: flex;
  justify-content: space-between;
}
.analyticsLeft {
  box-sizing: border-box;
  padding: 1.5rem;
  width: 65%;
  height: 100%;
  border-radius: 1rem;
  background-color: #fff;
  box-shadow: 5px 5px 10px #00000026;
}
.analyticsRight {
  width: 30%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .rightItem1 {
    box-sizing: border-box;
    padding: 0 5%;
    width: 100%;
    height: 40%;
    border-radius: 1rem;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 5px 5px 10px #00000026;
  }
  .rightItem2 {
    box-sizing: border-box;
    padding: 0 5%;
    width: 100%;
    height: 50%;
    border-radius: 1rem;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 5px 5px 10px #00000026;
  }
}
.smallTips {
  color: #939aa5;
}
.timeBox {
  padding: 0.3rem 0.8rem;
  background-color: #ebecedf0;
  border-radius: 0.5rem;
  cursor: pointer;
}
.echarsBox {
  margin-top: 1rem;
  width: 100%;
  height: 23rem;
}
.rateNumber {
  font-size: 2.5rem;
  font-weight: 600;
}
.progressBox {
  width: 5rem;
  height: 5rem;
}
:deep(.el-progress-circle) {
  width: 5rem !important;
  height: 5rem !important;
}
.longBox {
  width: 100%;
  margin-top: 1rem;
}
.bottomTip {
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  justify-content: end;
  color: #939aa5;
}
.icon_Box {
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f7f5e4;
  border-radius: 0.5rem;
  img {
    width: 50%;
  }
}
.contentBox{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;
}
.userPicBox{
  margin-top: 1rem;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bigTips{
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}
.formBox{
  width: 100%;
  margin-top: 1rem;
}
.labelName{
  margin: 1rem 0 0.5rem;
}
:deep(.el-input__wrapper){
  background-color: #fff !important;
  border-radius: 0.5rem !important;
  height: 2.2rem !important;
}
.cancelBtn{
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  color: #808080;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-right: 1rem;
    border: 1px solid transparent;
}
.cancelBtn:hover{
  border: 1px solid rgb(127, 126, 126);
}
.saveBtn{
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  color: #fff;
  background-color: #135bec;
  border-radius: 0.5rem;
  cursor: pointer;
}
.saveBtn:hover{
  background-color: #2868e7;
}
.Avatar{
  img{
    width: 100%;
  }
}
</style>
