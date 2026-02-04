<template>
  <div class="mainBox">
    <div class="bigTitle">{{ $t('projects.fileAlert') }}</div>
    <div class="littleSpan">
      {{ $t('projects.manageWhoReceives') }}"{{ props.mentionsDate.fileName }}"
    </div>
    <div class="tableBox">
      <el-table
        ref="tableRef"
        :data="userStore.usersTable"
        style="width: 100%; height: 15rem"
        @selection-change="handleSelectionChange"
      >
        <el-table-column fixed type="selection" width="55" />
        <el-table-column :label="$t('projects.MEMBER')" width="250">
          <template #default="scope">
            <div class="nameBox">
              <div class="picBox">
                <img :src="scope.row.pic" alt="用户头像" />
              </div>
              <div>{{ scope.row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="postion" :label="$t('projects.ROLE')" width="250" />
        <el-table-column :label="$t('projects.STATUS')" width="176">
          <template #default="scope">
            <div
              class="statusStyle1"
              :class="scope.row.status === 'offline' ? 'statusStyle2' : ''"
            >
              {{ $t(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="numberBox">{{ selectedNum }} {{$t('projects.MEMBERSSELECTED')}}</div>
    <div class="noteBox"> {{$t('projects.addANoteForTeam')}}</div>
    <div>
      <el-input
        v-model="props.mentionsDate.note"
        style="width: 100%"
        :rows="5"
        type="textarea"
        :placeholder="$t('projects.enterContextFile')"
        resize="none"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { ElTable } from "element-plus";

const userStore = useUserStore();
const textarea = ref("");
const tableRef = ref<InstanceType<typeof ElTable>>();
const selectedNum = ref(0);
interface MentionsDate {
  members: string[];
  note: string;
  fileName: string;
}

const props = defineProps<{
  mentionsDate?: MentionsDate;
}>();

const handleSelectionChange = (selection: UserItem[]) => {
  props.mentionsDate.members = selection.map(user => user.userId);
  // 更新显示的选中数量文本
  selectedNum.value = selection.length;
};


</script>
<style scoped lang="scss">
.mainBox {
  box-sizing: border-box;
  width: 100%;
  color: black;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
.littleSpan {
  margin-top: 0.2rem;
  color: #69768b;
}
.numberBox {
  padding: 0.3rem 0.8rem;
  margin-top: 0.5rem;
  width: fit-content;
  color: #2563eb;
  font-weight: 500;
  font-size: 0.8rem;
  border-radius: 1rem;
  background-color: #eff6ff;
  border: 1px solid #2563eb;
}
.tableBox {
  margin-top: 1rem;
  box-sizing: border-box;
  border: 1px solid #ebeef5;
  border-radius: 1rem;
  overflow: hidden;
}
.noteBox {
  margin: 1rem 0;
  font-weight: 600;
}
.nameBox {
  display: flex;
  gap: 1rem;
  align-items: center;
  color: black;
  .picBox {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 100%;
    }
  }
}
.statusStyle1 {
  padding: 0.2rem 0.5rem;
  width: fit-content;
  background-color: #2564ebca;
  color: #fff;
  border-radius: 0.5rem;
}
.statusStyle2 {
  padding: 0.2rem 0.5rem;
  width: fit-content;
  background-color: #e2e8f0;
  color: #666971;
  border-radius: 0.5rem;
}
:deep(.el-table th.el-table__cell) {
  background-color: #f6f8f9;
}
</style>
