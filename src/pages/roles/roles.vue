<!--优化点：根据中英文修改输入框的不同输入长度限制-->
<template>
  <div class="bigBox">
    <div class="bigTitle" style="">{{ $t('roles.RolePosition') }}</div>
    <span class="smallText">
      {{$t('roles.Manageaccess')}}</span
    >
    <br />
    <span class="smallText"> {{$t('roles.teammembers')}}</span>
    <div class="Line_two bottomLine">
      <div class="changeBox">
        <div
          class="changeItem"
          @click="chooseWhich = 0"
          :class="chooseWhich == 0 ? 'chooseItem' : ''"
        >
          {{$t('roles.PermissionRoles')}}
        </div>
        <div
          class="changeItem"
          @click="chooseWhich = 1"
          :class="chooseWhich == 1 ? 'chooseItem' : ''"
        >
          {{$t('roles.PositionTitles')}}
        </div>
      </div>
      <div v-if="chooseWhich == 0" class="addBtn" @click="addOne('Role')">+ {{$t('roles.AddNewRole')}}</div>
      <div v-if="chooseWhich == 1" class="addBtn" @click="addOne('Position')">+ {{$t('roles.AddNewPosition')}}</div>
    </div>
    <div v-if="chooseWhich == 0" class="teamBox">
      <div class="RoleItem" v-for="(item, index) in roleStore.allRoles" :key="index">
        <div class="roleTitle">{{ $t(item.roleName) }}</div>
        <div class="roleMess">{{ item.roleMess }}</div>
        <div class="switchBigBox">
          <div class="roleItem_Kind">{{$t('roles.PROJECTACCESS')}}</div>
          <div
            class="switchBox"
            v-for="(lowItem, index) in item.tasksData"
            :key="index"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="lowItem.value"
              style="--el-switch-on-color: #2eb867"
            />
          </div>
          <div class="roleItem_Kind">{{$t('roles.TEAMPEOPLE')}}</div>
          <div
            class="switchBox"
            v-for="(lowItem, index) in item.membersData"
            :key="index"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="lowItem.value"
              style="--el-switch-on-color: #2eb867"
            />
          </div>
          <div class="roleItem_Kind">{{$t('roles.COLLABORATION')}}</div>
          <div
            class="switchBox"
            v-for="(lowItem, index) in item.documentsData"
            :key="index"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="lowItem.value"
              style="--el-switch-on-color: #2eb867"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="chooseWhich == 1" class="teamBox" style="gap:0;">
      <FileCard
        v-for="item in roleStore.allpositions"
        :key="item.positionName"
        :ifFolder="false"
        :fileName="item.positionName"
        :fileTime="item.positionMess"
        :fileSize="item.count + $t('roles.members')"
      />
    </div>
  </div>
  <el-dialog
    v-model="rolesDialogVisible"
    :title="$t('roles.AddNewRole')"
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t('roles.RoleName') }}</div>
    <el-input
      v-model="newRoleData.roleName"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
    ></el-input>
     <div class="inputName">{{ $t('roles.RoleDescription') }}</div>
    <el-input
      v-model="newRoleData.roleDescription"
      style="width: 100%;"
      maxlength="20"
      :placeholder="$t('pleaseEnterContent')"
      show-word-limit
      resize="none"
      word-limit-position="outside"
      type="textarea"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="rolesDialogVisible = false" class="cancelBtn">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" @click="addSubmit('Role')" class="confirmBtn">
          {{ $t('roles.AddRole') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="positionsDialogVisible"
    :title="$t('roles.AddNewPosition')"
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t('roles.PositionName') }}</div>
    <el-input
      v-model="newPositionData.positionName"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
    ></el-input>
     <div class="inputName">{{ $t('roles.PositionDescription') }}</div>
    <el-input
      v-model="newPositionData.positionDescription"
      style="width: 100%;"
      maxlength="20"
      :placeholder="$t('pleaseEnterContent')"
      show-word-limit
      resize="none"
      word-limit-position="outside"
      type="textarea"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="positionsDialogVisible = false" class="cancelBtn">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" @click="addSubmit('Position')" class="confirmBtn">
          {{ $t('roles.AddPosition') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue";
import FileCard from "@/components/fileCard.vue";
import { useRoleStore } from "@/stores/roleStore";
const roleStore = useRoleStore();
const chooseWhich = ref(0);
const rolesDialogVisible = ref(false);
const positionsDialogVisible = ref(false);
const newRoleData = reactive({
  roleName: "",
  roleDescription:""
})
const newPositionData = reactive({
  positionName: "",
  positionDescription:""
})
const addOne = (kind: string) =>{
  if(kind === "Role"){
    newRoleData.roleName = "";
    newRoleData.roleDescription = "";
    rolesDialogVisible.value = true;
  } else {
    newPositionData.positionName = "";
    newPositionData.positionDescription = "";
    positionsDialogVisible.value = true;
  }
}
const addSubmit = (kind:string) => {
  if(kind === "Role"){
    roleStore.allRoles.unshift({
      roleName: newRoleData.roleName,
      roleMess: newRoleData.roleDescription,
      //任务权限
      tasksData: [
        {
          label: "Create Tasks",
          value: false,
        },
        {
          label: "Delete Tasks",
          value: false,
        },
        {
          label: "Edit All Tasks",
          value: false,
        },
        {
          label: "Edit Own Tasks",
          value: false,
        },
        {
          label: "Edit Time Line",
          value: false,
        },
      ],
      //成员权限
      membersData: [
        {
          label: "Invite Members",
          value: false,
        },
        {
          label: "Delete Members",
          value: false,
        },
        {
          label: "Manage Roles",
          value: false,
        },
        {
          label: "Manage Positions",
          value: false,
        },
      ],
      //协作权限(文件权限默认创建者有删除的权限,回收站同理)
      documentsData: [
        {
          label: "Create Documents",
          value: false,
        },
        {
          label: "Delete All Documents",
          value: false,
        },
        {
          label: "Chat",
          value: false,
        },
      ],
    });
    rolesDialogVisible.value = false;
  }else{
    roleStore.allpositions.unshift({
      positionName: newPositionData.positionName,
      positionMess: newPositionData.positionDescription,
      count: 0 
    })
    positionsDialogVisible.value = false;
  }
}
</script>
<style scoped lang="scss">
.changeBox {
  display: flex;
}
.bottomLine {
  margin-top: 1rem;
  border-bottom: 1px solid rgba(161, 159, 159, 0.791);
}
.changeItem {
  padding: 1rem 0;
  margin-right: 2rem;
  cursor: pointer;
}
.chooseItem {
  color: green;
  border-bottom: 2px solid green;
}
.addBtn {
  margin-bottom: 0.5rem;
  background-color: #2eb867;
  cursor: pointer;
  color: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 5px 5px 4px rgba(0, 0, 0, 0.1);
}
.addBtn:hover {
  background-color: #279d5cde;
}
.RoleItem {
  box-sizing: border-box;
  width: 31.5%;
  min-width: 15rem;
  height: 25rem;
  background-color: #fff;

  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}
.roleTitle {
  font-size: 1.2rem;
  font-weight: 600;
}
.roleMess {
  width: 100%;
  margin-top: 0.5rem;
  font-size: small;
  color: gray;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(200, 197, 197, 0.791);
  //设置文本不换行，超出范围省略号表示
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.switchBigBox {
  width: 100%;
  height: 80%;
  overflow: auto;
  /* 隐藏标准滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.roleItem_Kind {
  margin: 0.8rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: gray;
}
.switchBox {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
:deep(.el-input__wrapper) {
  box-sizing: border-box;
  height: 2rem !important;
  border-radius: 0 !important;
  padding: 0.2rem 0.5rem !important;
  background-color: #fff !important;
  border: 1px solid #ccc;
  box-shadow: none;
}
:deep(.el-textarea__inner:focus-within){
  border: 1px solid black !important;
  box-shadow: none;
}
:deep(.el-input__inner) {
  font-weight: 500;
  font-size: 1rem;
}
:deep(.el-input__wrapper:focus-within){
  border: 1px solid black;
}
.cancelBtn {
  height: 2.5rem;
  border: none;
  font-weight: 600;
  font-size: large;
  margin-right: 2rem;
  padding: 0 1.5rem;
}
.cancelBtn:hover {
  background-color: #b5b7b8a9;
  color: white;
}
.confirmBtn {
  height: 2.5rem;
  background-color: #1ea358;
  color: white;
  font-weight: 600;
  font-size: large;
  margin-right: 2rem;
  border-radius: 0.5rem;
  padding: 0 1.5rem;
}
.confirmBtn:hover{
  background-color: #029140;
}
</style>
