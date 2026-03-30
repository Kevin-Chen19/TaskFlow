<!--优化点：根据中英文修改输入框的不同输入长度限制-->
<template>
  <div class="bigBox">
    <div class="bigTitle" style="">{{ $t("roles.RolePosition") }}</div>
    <span class="smallText"> {{ $t("roles.Manageaccess") }}</span>
    <br />
    <span class="smallText"> {{ $t("roles.teammembers") }}</span>
    <div class="Line_two bottomLine">
      <div class="changeBox">
        <div
          class="changeItem"
          @click="chooseWhich = 0"
          :class="chooseWhich == 0 ? 'chooseItem' : ''"
        >
          {{ $t("roles.PermissionRoles") }}
        </div>
        <div
          class="changeItem"
          @click="chooseWhich = 1"
          :class="chooseWhich == 1 ? 'chooseItem' : ''"
        >
          {{ $t("roles.PositionTitles") }}
        </div>
      </div>
      <div v-if="chooseWhich == 0" class="addBtn" @click="addOne('Role')">
        + {{ $t("roles.AddNewRole") }}
      </div>
      <div v-if="chooseWhich == 1" class="addBtn" @click="addOne('Position')">
        + {{ $t("roles.AddNewPosition") }}
      </div>
    </div>
    <div v-if="chooseWhich == 0" class="teamBox">
      <div
        class="RoleItem"
        v-for="(item, index) in translatedRoles"
        :key="item.id || index"
      >
        <div class="roleHeader">
          <div class="roleTitle">{{ item.roleName }}</div>
          <div class="roleActions">
            <el-icon @click="addOne('Role', roleStore.allRoles[index])" class="actionIcon">
              <Edit />
            </el-icon>
            <el-icon @click="deleteRole(roleStore.allRoles[index])" class="actionIcon deleteIcon">
              <Delete />
            </el-icon>
          </div>
        </div>
        <div class="roleMess">{{ item.roleMess }}</div>
        <div class="switchBigBox">
          <div class="roleItem_Kind">{{ $t("roles.PROJECTACCESS") }}</div>
          <div
            class="switchBox"
            v-for="(lowItem, subIndex) in item.tasksData"
            :key="subIndex"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="roleStore.allRoles[index].tasksData[subIndex].value"
              style="--el-switch-on-color: #2eb867"
              @change="() => updatePermission(roleStore.allRoles[index], index)"
            />
          </div>
          <div class="roleItem_Kind">{{ $t("roles.TEAMPEOPLE") }}</div>
          <div
            class="switchBox"
            v-for="(lowItem, subIndex) in item.membersData"
            :key="subIndex"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="roleStore.allRoles[index].membersData[subIndex].value"
              style="--el-switch-on-color: #2eb867"
              @change="() => updatePermission(roleStore.allRoles[index], index)"
            />
          </div>
          <div class="roleItem_Kind">{{ $t("roles.COLLABORATION") }}</div>
          <div
            class="switchBox"
            v-for="(lowItem, subIndex) in item.documentsData"
            :key="subIndex"
          >
            <div>{{ lowItem.label }}</div>
            <el-switch
              v-model="roleStore.allRoles[index].documentsData[subIndex].value"
              style="--el-switch-on-color: #2eb867"
              @change="() => updatePermission(roleStore.allRoles[index], index)"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="chooseWhich == 1" class="teamBox" style="gap: 0">
      <FileCard
        v-for="item in roleStore.allpositions"
        :key="item.id || item.positionName"
        :ifFolder="false"
        :ifJob="true"
        :fileName="item.positionName"
        :fileTime="item.positionMess"
        :fileSize="item.count + $t('roles.members')"
        @edit="editPosition(item)"
        @delete="deletePosition(item)"
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
    <div class="inputName">{{ $t("roles.RoleName") }}</div>
    <el-input
      v-model="newRoleData.roleName"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
    ></el-input>
    <div class="inputName">{{ $t("roles.RoleDescription") }}</div>
    <el-input
      v-model="newRoleData.roleDescription"
      style="width: 100%"
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
          {{ $t("cancel") }}
        </el-button>
        <el-button type="primary" @click="addSubmit('Role')" class="confirmBtn">
          {{ $t("roles.AddRole") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="positionsDialogVisible"
    :title="editMode && currentEditPositionId ? $t('roles.EditPosition') : $t('roles.AddNewPosition')"
    width="600"
    align-center
  >
    <div class="line"></div>
    <div class="inputName">{{ $t("roles.PositionName") }}</div>
    <el-input
      v-model="newPositionData.positionName"
      :placeholder="$t('pleaseEnterContent')"
      class="content-input"
    ></el-input>
    <div class="inputName">{{ $t("roles.PositionDescription") }}</div>
    <el-input
      v-model="newPositionData.positionDescription"
      style="width: 100%"
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
          {{ $t("cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="addSubmit('Position')"
          class="confirmBtn"
        >
          {{ $t("roles.AddPosition") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { Edit, Delete } from "@element-plus/icons-vue";
import FileCard from "@/components/fileCard.vue";
import { useRoleStore, type RoleItem } from "@/stores/roleStore";
import { useOtherStore } from "@/stores/otherStore";
import { getProjectPositions, createProjectPosition, updateProjectPosition, deleteProjectPosition } from "@/api";
import i18n from '@/language';
import { debounce } from 'lodash-es';
const t = i18n.global.t
const roleStore = useRoleStore();
const otherStore = useOtherStore();
const chooseWhich = ref(0);
const rolesDialogVisible = ref(false);
const positionsDialogVisible = ref(false);
const editMode = ref(false);
const currentEditRoleId = ref<number | null>(null);
const currentEditPositionId = ref<number | null>(null);

// 存储每个角色正在更新的权限索引，用于显示加载状态
const updatingPermissions = ref<Map<number, {index: number, type: string}>>(new Map());

// 计算属性：动态翻译角色数据，确保语言切换时自动更新
const translatedRoles = computed(() => {
  return roleStore.allRoles.map(role => ({
    ...role,
    roleName: role.roleName.startsWith('roleStore.') ? t(role.roleName) : role.roleName,
    tasksData: role.tasksData.map(item => ({
      label: item.label.startsWith('roleStore.') ? t(item.label) : t(`roleStore.${item.label}`),
      value: item.value
    })),
    membersData: role.membersData.map(item => ({
      label: item.label.startsWith('roleStore.') ? t(item.label) : t(`roleStore.${item.label}`),
      value: item.value
    })),
    documentsData: role.documentsData.map(item => ({
      label: item.label.startsWith('roleStore.') ? t(item.label) : t(`roleStore.${item.label}`),
      value: item.value
    }))
  }));
});

const newRoleData = reactive({
  roleName: "",
  roleDescription: "",
});

const newPositionData = reactive({
  positionName: "",
  positionDescription: "",
});

// 防抖的权限更新函数
const debouncedUpdateRole = debounce(async (roleId: number, role: RoleItem) => {
  try {
    const result = await roleStore.updateRoleSettings(roleId, role);
    if (result.success) {
      ElMessage.success('权限更新成功');
    } else {
      ElMessage.error(result.message || '权限更新失败');
    }
  } catch (error) {
    console.error('更新权限失败:', error);
    ElMessage.error('权限更新失败');
  }
}, 1500);

// 更新权限设置
const updatePermission = async (role: RoleItem, index: number) => {
  if (!role.id) return;

  try {
    // 调用 store 方法更新权限
    const result = await roleStore.updateRoleSettings(role.id, role);
    if (result.success) {
      // 不显示成功消息，避免频繁提示
    } else {
      ElMessage.error(result.message || '权限更新失败');
    }
  } catch (error) {
    console.error('更新权限失败:', error);
    ElMessage.error('权限更新失败');
  }
};

// 打开角色对话框（新增或编辑）
const addOne = (kind: string, role?: RoleItem) => {
  if (kind === "Role") {
    if (role && role.id) {
      // 编辑模式
      editMode.value = true;
      currentEditRoleId.value = role.id || null;
      currentEditPositionId.value = null;
      newRoleData.roleName = role.roleName;
      newRoleData.roleDescription = role.roleMess;
    } else {
      // 新增模式
      editMode.value = false;
      currentEditRoleId.value = null;
      currentEditPositionId.value = null;
      newRoleData.roleName = "";
      newRoleData.roleDescription = "";
    }
    rolesDialogVisible.value = true;
  } else {
    // 新增职位
    editMode.value = false;
    currentEditRoleId.value = null;
    currentEditPositionId.value = null;
    newPositionData.positionName = "";
    newPositionData.positionDescription = "";
    positionsDialogVisible.value = true;
  }
};

// 编辑职位
const editPosition = (position: any) => {
  if (position.id) {
    editMode.value = true;
    currentEditPositionId.value = position.id;
    currentEditRoleId.value = null;
    newPositionData.positionName = position.positionName;
    newPositionData.positionDescription = position.positionMess;
    positionsDialogVisible.value = true;
  }
};

// 提交角色（新增或编辑）
const addSubmit = async (kind: string) => {
  if (kind === "Role") {
    if (!newRoleData.roleName) {
      ElMessage.warning('请输入角色名称');
      return;
    }

    const roleData: RoleItem = {
      roleName: newRoleData.roleName,
      roleMess: newRoleData.roleDescription,
      tasksData: [
        { label: 'CreateTasks', value: false },
        { label: 'DeleteTasks', value: false },
        { label: 'EditAllTasks', value: false },
        { label: 'EditOwnTasks', value: false },
        { label: 'EditProjectMilestones', value: false },
      ],
      membersData: [
        { label: 'InviteMembers', value: false },
        { label: 'DeleteMembers', value: false },
        { label: 'ManageRoles', value: false },
        { label: 'ManagePositions', value: false },
      ],
      documentsData: [
        { label: 'CreateDocuments', value: false },
        { label: 'DeleteAllDocuments', value: false },
        { label: 'Chat', value: false },
      ],
    };

    const projectId = otherStore.currentProjectId;
    let result;

    if (editMode.value && currentEditRoleId.value) {
      // 编辑角色
      result = await roleStore.updateRole(currentEditRoleId.value, roleData);
      if (result.success) {
        ElMessage.success('角色更新成功');
      } else {
        ElMessage.error(result.message || '角色更新失败');
      }
    } else {
      // 新增角色
      result = await roleStore.createRole(projectId, roleData);
      if (result.success) {
        ElMessage.success('角色创建成功');
      } else {
        ElMessage.error(result.message || '角色创建失败');
      }
    }

    if (result.success) {
      rolesDialogVisible.value = false;
    }
  } else {
    await addPosition();
    positionsDialogVisible.value = false;
  }
};

// 删除角色
const deleteRole = async (role: RoleItem) => {
  if (!role.id) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.roleName}" 吗？`,
      '删除角色',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const result = await roleStore.deleteRole(role.id);
    if (result.success) {
      ElMessage.success('角色删除成功');
    } else {
      ElMessage.error(result.message || '角色删除失败');
    }
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel') {
      console.error('删除角色失败:', error);
    }
  }
};

// 加载项目角色数据
const loadRoles = async () => {
  try {
    const projectId = otherStore.currentProjectId;
    await roleStore.loadRoles(projectId);
  } catch (error) {
    console.error("加载角色数据失败:", error);
  }
};

// 加载项目职位数据
const loadPositions = async () => {
  try {
    const projectId = otherStore.currentProjectId;
    const positionRes = await getProjectPositions({
      project_id: projectId,
    });
    if (positionRes.success && positionRes.data) {
      roleStore.allpositions.splice(0, roleStore.allpositions.length,
        ...positionRes.data.map((item: any) => ({
          id: item.id,
          positionName: item.positionname,
          positionMess: item.description,
          count: 0
        }))
      );
      console.log(roleStore.allpositions);
    }
  } catch (error) {
    console.error("加载职位数据失败:", error);
  }
};

// 新增或编辑项目职位
const addPosition = async () => {
  try {
    const projectId = otherStore.currentProjectId;

    if (editMode.value && currentEditPositionId.value) {
      // 编辑职位
      const updateRes = await updateProjectPosition(currentEditPositionId.value, {
        positionname: newPositionData.positionName,
        description: newPositionData.positionDescription
      });
      if (updateRes.success) {
        const index = roleStore.allpositions.findIndex(p => p.id === currentEditPositionId.value);
        if (index !== -1) {
          roleStore.allpositions[index] = {
            id: currentEditPositionId.value,
            positionName: newPositionData.positionName,
            positionMess: newPositionData.positionDescription,
            count: roleStore.allpositions[index].count
          };
        }
        ElMessage.success('职位更新成功');
      } else {
        ElMessage.error('职位更新失败');
      }
    } else {
      // 新增职位
      const addRes = await createProjectPosition({
        project_id: projectId,
        positionname: newPositionData.positionName,
        description: newPositionData.positionDescription
      });
      if (addRes.success && addRes.data) {
        roleStore.allpositions.unshift({
          id: addRes.data.id,
          positionName: newPositionData.positionName,
          positionMess: newPositionData.positionDescription,
          count: 0,
        });
        ElMessage.success('职位创建成功');
      } else {
        ElMessage.error('职位创建失败');
      }
    }
  } catch (error) {
    console.error("职位操作失败:", error);
    ElMessage.error(editMode.value ? '职位更新失败' : '职位创建失败');
  }
};

// 删除项目职位
const deletePosition = async (position: any) => {
  if (!position.id) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除职位 "${position.positionName}" 吗？`,
      '删除职位',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const res = await deleteProjectPosition(position.id);
    if (res.success) {
      const index = roleStore.allpositions.findIndex(p => p.id === position.id);
      if (index !== -1) {
        roleStore.allpositions.splice(index, 1);
      }
      ElMessage.success('职位删除成功');
    } else {
      ElMessage.error('职位删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error("删除职位失败:", error);
    }
  }
};

onMounted(() => {
  loadRoles();
  loadPositions();
});
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
.roleHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.roleTitle {
  font-size: 1.2rem;
  font-weight: 600;
}
.roleActions {
  display: flex;
  gap: 0.5rem;
}
.actionIcon {
  cursor: pointer;
  font-size: 1.2rem;
  color: #666;
  transition: color 0.2s;
}
.actionIcon:hover {
  color: #2eb867;
}
.deleteIcon:hover {
  color: #f56c6c;
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
:deep(.el-textarea__inner:focus-within) {
  border: 1px solid black !important;
  box-shadow: none;
}
:deep(.el-input__inner) {
  font-weight: 500;
  font-size: 1rem;
}
:deep(.el-input__wrapper:focus-within) {
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
.confirmBtn:hover {
  background-color: #029140;
}
</style>
