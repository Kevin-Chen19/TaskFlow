<template>
  <div class="bigBox1">
    <div class="userBox">
      <div class="topBox">
        <div class="picBox">
          <div class="picItem">
            <img :src="userStore.user.pic" alt="用户头像" />
          </div>
        </div>
        <div class="editBox" @click="dialogFormVisible = true">
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
          @click="open(item.projectName)"
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
          @click="open(item.projectName)"
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
            <Velocity></Velocity>
          </div>
        </div>
        <div class="analyticsRight">
          <div class="rightItem1">
            <div>
              <div class="smallTips">{{ $t('me.OntimeCompletion') }}</div>
              <div class="rateNumber">94%</div>
            </div>
            <div class="progressBox">
              <el-progress
                type="dashboard"
                :percentage="94"
                width="70"
                color="#9256f5"
              >
                <template #default="{ percentage }">
                  <span style="font-size: 1.2rem; font-weight: 600">A+</span>
                </template>
              </el-progress>
            </div>
          </div>
          <div class="rightItem2">
            <div class="Line_two" style="align-items: center">
              <div>
                <div class="smallTips">{{ $t('me.Numberoftasks') }}</div>
                <div class="rateNumber">25</div>
              </div>
              <div class="icon_Box">
                <img src="@/assets/icons/闪电.png" alt="闪电图标" />
              </div>
            </div>
            <div class="longBox">
              <el-progress
                :show-text="false"
                :percentage="userStore.user.percentage"
                :stroke-width="16"
                color="#9256f5"
              />
            </div>
            <div class="bottomTip">{{ $t('me.ratereached') }} {{userStore.user.percentage}}%</div>
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
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          :show-file-list="false"
          :on-change="handleChange"
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
        <el-input v-model="userStore.user.name"></el-input>
        <div class="labelName">{{ $t('me.Position') }}</div>
        <el-input v-model="userStore.user.postion" disabled></el-input>
        <div class="labelName">{{ $t('me.SkillTags') }}</div>
        <el-input-tag
              v-model="userStore.user.tags"
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              :placeholder="$t('pleaseEnterContent')"
              aria-label="Please click the Enter key after input"
            />
        <div class="labelName">{{ $t('me.EmailAddress') }}</div>
        <el-input v-model="userStore.user.email"></el-input>
        <div class="labelName">{{ $t('team.SIGNATURE') }}</div>
        <el-input v-model="userStore.user.signature"></el-input>
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
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { ElMessageBox } from "element-plus";
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
const userStore = useUserStore();
import avatarImg from "@/assets/pics/用户头像.jpg";
import defaultAvatarImg from "@/assets/pics/用户头像.jpg";
const allProjects = [
  {
    id: "202601271",
    creator: "202601051",
    projectName: "项目管理平台PC端",
    description:
      "Final UI polish and integration testing before the beta release next month1.",
    percentage: 70,
    joinUser: ["202601051", "202601053", "202601054"],
  },
  {
    id: "202601272",
    creator: "202601051",
    projectName: "项目管理平台移动端",
    description:
      "Final UI polish and integration testing before the beta release next month2.",
    percentage: 40,
    joinUser: ["202601051", "202601053", "202601054", "202601055"],
  },
  {
    id: "202601273",
    creator: "202601051",
    projectName: "Electron跨端终端图形化命令行工具",
    description:
      "Final UI polish and integration testing before the beta release next month3.",
    percentage: 20,
    joinUser: ["202601051", "202601053", "202601055", "202601054"],
  },
  {
    id: "202601274",
    creator: "202601053",
    projectName: "Project Name4",
    description:
      "Final UI polish and integration testing before the beta release next month.4",
    percentage: 70,
    joinUser: ["202601051", "202601053", "202601054"],
  },
  {
    id: "202601275",
    creator: "202601054",
    projectName: "Project Name5",
    description:
      "Final UI polish and integration testing before the beta release next month.5",
    percentage: 70,
    joinUser: ["202601051", "202601053", "202601054"],
  },
  {
    id: "202601271",
    creator: "202601051",
    projectName: "项目管理平台PC端2",
    description:
      "Final UI polish and integration testing before the beta release next month1.",
    percentage: 70,
    joinUser: ["202601051", "202601053", "202601054"],
  },
  {
    id: "202601272",
    creator: "202601051",
    projectName: "项目管理平台移动端2",
    description:
      "Final UI polish and integration testing before the beta release next month2.",
    percentage: 40,
    joinUser: ["202601051", "202601053", "202601054", "202601055"],
  },
  {
    id: "202601273",
    creator: "202601051",
    projectName: "Electron跨端终端图形化命令行工具2",
    description:
      "Final UI polish and integration testing before the beta release next month3.",
    percentage: 20,
    joinUser: ["202601051", "202601053", "202601055", "202601054"],
  },
  {
    id: "202601274",
    creator: "202601053",
    projectName: "Project Name9",
    description:
      "Final UI polish and integration testing before the beta release next month.4",
    percentage: 70,
    joinUser: ["202601051", "202601053", "202601054"],
  },
  {
    id: "202601275",
    creator: "202601054",
    projectName: "Project Name8",
    description:
      "Final UI polish and integration testing before the beta release next month.5",
    percentage: 70,
    joinUser: ["202601051", "202601053", "202601054"],
  },
];
const MyPageNum = ref(0);
const JoinPageNum = ref(0);
const dialogFormVisible = ref(false);
const imageUrl = ref('')
const MyProjects = reactive([]);
const JoinProjects = reactive([]);
const avator = ref('');
const avatorFile = ref(null)
const defaultPic = ref(defaultAvatarImg)
onMounted(() => {
  MyProjects.push(
    ...allProjects.filter((item) => item.creator === userStore.user.userId),
  );
  JoinProjects.push(
    ...allProjects.filter(
      (item) =>
        item.joinUser.includes(userStore.user.userId) &&
        item.creator !== userStore.user.userId,
    ),
  );
});
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
const handleChange = async (file) => {
  avator.value = URL.createObjectURL(file.raw)
  avatorFile.value = file.raw
  console.log(avatorFile.value , avator.value )
}
const open = (name: string) => {
 ElMessageBox.alert(`Are you sure to switch the current project to ${name}?`, 'Switch Project', {
    confirmButtonText: 'OK',
    showCancelButton: 'true'
  })
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
const saveProfile = () => {
  if(avator.value !== ''){
    userStore.user.pic = avator.value;
  }
  dialogFormVisible.value = false;
}
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
