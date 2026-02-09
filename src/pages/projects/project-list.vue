<template>
  <div class="project-list">
    <div class="header">
      <h1>项目管理</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建项目
      </el-button>
    </div>

    <div class="project-grid" v-loading="loading">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="card-header">
          <h3>{{ project.name }}</h3>
          <el-dropdown>
            <el-icon class="more-icon"><More /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleEdit(project)">编辑</el-dropdown-item>
                <el-dropdown-item @click="handleDelete(project.id)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <p class="description">{{ project.description || '暂无描述' }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: project.progress + '%' }"></div>
        </div>
        <div class="card-footer">
          <span class="progress-text">进度: {{ project.progress }}%</span>
          <span class="hours">工时: {{ project.total_hours }}h</span>
        </div>
      </div>

      <el-empty v-if="!loading && projects.length === 0" description="暂无项目" />
    </div>

    <!-- 创建/编辑项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? '编辑项目' : '新建项目'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="负责人ID">
          <el-input-number v-model="form.owner_id" :min="1" />
        </el-form-item>
        <el-form-item label="工时">
          <el-input-number v-model="form.total_hours" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, More } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjects, createProject, updateProject, deleteProject } from '@/api'
import type { Project } from '@/types/user'

const loading = ref(false)
const projects = ref<Project[]>([])
const showCreateDialog = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const currentProjectId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  owner_id: 1,
  total_hours: 0,
  assignee_ids: [] as number[],
})

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getProjects()
    if (res.success) {
      projects.value = res.data || []
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value && currentProjectId.value) {
      await updateProject(currentProjectId.value, form.value)
      ElMessage.success('项目更新成功')
    } else {
      await createProject(form.value)
      ElMessage.success('项目创建成功')
    }
    showCreateDialog.value = false
    fetchProjects()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 编辑项目
const handleEdit = (project: Project) => {
  isEdit.value = true
  currentProjectId.value = project.id
  form.value = {
    name: project.name,
    description: project.description || '',
    owner_id: project.owner_id,
    total_hours: project.total_hours,
    assignee_ids: project.assignee_ids || [],
  }
  showCreateDialog.value = true
}

// 删除项目
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
      type: 'warning',
    })
    await deleteProject(id)
    ElMessage.success('项目删除成功')
    fetchProjects()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped lang="scss">
.project-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h1 {
    margin: 0;
    font-size: 24px;
  }
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
  }

  .more-icon {
    cursor: pointer;
    color: #909399;

    &:hover {
      color: #409eff;
    }
  }
}

.description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  min-height: 40px;
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 4px;
  transition: width 0.3s;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #909399;
}

.progress-text {
  color: #67c23a;
  font-weight: 500;
}
</style>
