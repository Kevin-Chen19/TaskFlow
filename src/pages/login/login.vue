<template>
  <div class="bigBox">
    <div class="left" v-if="!isMobile">
      <div class="pics">
        <img src="../../assets/pics/登录页.png" alt="登录页图片" />
      </div>
      <div class="texts">
        <div class="bigTips">"{{ $t('loginPage.Asimple') }}"</div>
        <div class="smallTips">
          {{ $t('loginPage.Simpleefficient') }}
        </div>
        <div class="smallTips">
          {{ $t('loginPage.anintuitive') }}
        </div>
      </div>
    </div>
    <div class="right">
      <div class="right_box">
        <div class="bigTips">{{ loginTitle }}</div>
        <div class="smallTips">
          {{ $t('loginPage.Enteryour') }}
        </div>
        <el-form
          ref="ruleFormRef"
          style="max-width: 400px"
          :model="ruleForm"
          status-icon
          :rules="rules"
          label-position="top"
          label-width="auto"
          class="form_el"
        >
          <!-- 手机号 -->
          <el-form-item :label="$t('loginPage.PhoneNumber')" prop="phoneNumber">
            <el-input
              v-model="ruleForm.phoneNumber"
              :placeholder="$t('loginPage.Enterphone')"
              autocomplete="off"
              :prefix-icon="Iphone"
            />
          </el-form-item>

          <!-- 姓名（注册时显示） -->
          <el-form-item v-if="loginStore.ifSignUp" :label="$t('loginPage.FullName')" prop="fullname">
            <el-input
              v-model="ruleForm.fullname"
              :placeholder="$t('loginPage.EnterFullName')"
              autocomplete="off"
            />
          </el-form-item>

          <!-- 邮箱（注册时显示） -->
          <el-form-item v-if="loginStore.ifSignUp" :label="$t('loginPage.Email')" prop="email">
            <el-input
              v-model="ruleForm.email"
              :placeholder="$t('loginPage.EnterEmail')"
              autocomplete="off"
            />
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item
            v-if="loginStore.ifSignUp || loginStore.ifForgot || isCodeLogin"
            :label="$t('loginPage.Identifying')"
            prop="identifyingNumber"
          >
            <el-input
              v-model="ruleForm.identifyingNumber"
              :placeholder="$t('loginPage.EnterIdentifying')"
              autocomplete="off"
              :prefix-icon="ChatDotRound"
            >
              <template #append>
                <div 
                  class="btn_getCode" 
                  :class="{ 'btn_disabled': countdown > 0 }"
                  @click="handleGetCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : $t('loginPage.getCode') }}
                </div>
              </template>
            </el-input>
          </el-form-item>

          <!-- 登录方式切换 -->
          <div v-if="!loginStore.ifSignUp && !loginStore.ifForgot" class="smallTips oneLine">
            <span class="PointStyle" @click="toggleLoginMode">
              {{ isCodeLogin ? '密码登录' : '验证码登录' }}
            </span>
          </div>

          <!-- 密码（登录和注册时显示） -->
          <el-form-item
            v-if="!loginStore.ifForgot && !isCodeLogin"
            :label="$t('loginPage.Password')"
            prop="password"
          >
            <el-input
              v-model="ruleForm.password"
              :placeholder="$t('loginPage.EnterPassword')"
              type="password"
              autocomplete="off"
              :prefix-icon="Lock"
              :show-password="true"
            />
          </el-form-item>

          <!-- 新密码（忘记密码时显示） -->
          <el-form-item
            v-if="loginStore.ifForgot"
            :label="$t('loginPage.NewPassword')"
            prop="password"
          >
            <el-input
              v-model="ruleForm.password"
              :placeholder="$t('loginPage.EnterNewPassword')"
              type="password"
              autocomplete="off"
              :prefix-icon="Lock"
              :show-password="true"
            />
          </el-form-item>

          <!-- 确认新密码（忘记密码时显示） -->
          <el-form-item
            v-if="loginStore.ifForgot"
            :label="$t('loginPage.ConfirmNewPassword')"
            prop="confirmPassword"
          >
            <el-input
              v-model="ruleForm.confirmPassword"
              :placeholder="$t('loginPage.EnterConfirmNewPassword')"
              type="password"
              autocomplete="off"
              :prefix-icon="Lock"
              :show-password="true"
            />
          </el-form-item>

          <!-- 确认密码（注册时显示） -->
          <el-form-item
            v-if="loginStore.ifSignUp"
            :label="$t('loginPage.ConfirmPassword')"
            prop="confirmPassword"
          >
            <el-input
              v-model="ruleForm.confirmPassword"
              :placeholder="$t('loginPage.EnterConfirmPassword')"
              type="password"
              autocomplete="off"
              :prefix-icon="Lock"
              :show-password="true"
            />
          </el-form-item>

          <!-- 切换登录/注册/忘记密码 -->
          <div class="smallTips oneLine">
            <div v-if="!loginStore.ifSignUp">
              {{$t('loginPage.havenoaccount')}}
              <span
                class="PointStyle"
                @click="
                  loginStore.ifSignUp = true;
                  loginStore.ifForgot = false;
                "
                >{{$t('loginPage.Signup')}}</span
              >
            </div>
            <div v-if="loginStore.ifSignUp">
              {{$t('loginPage.haveanaccount')}}
              <span
                class="PointStyle"
                @click="
                  loginStore.ifSignUp = false;
                  loginStore.ifForgot = false;
                "
                >{{$t('loginPage.Signin')}}</span
              >
            </div>
            <span
              v-if="!loginStore.ifSignUp"
              class="PointStyle"
              @click="
                loginStore.ifForgot = true;
                loginStore.ifSignUp = false;
              "
              >{{$t('loginPage.Forgotpassword')}}</span
            >
          </div>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm(ruleFormRef)"
              class="btn_sign"
              :loading="loading"
            >
              {{ submitButtonText }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Iphone, Lock, ChatDotRound } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { useLoginStore } from "../../stores/loginStore";
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import { useUserStore } from "../../stores/userStore";
import { socketService } from "@/services/socketService";

const { t } = useI18n();
const router = useRouter();
const loginStore = useLoginStore();
const userStore = useUserStore();
const ruleFormRef = ref<FormInstance>();
const loading = ref(false);

// 验证码登录模式
const isCodeLogin = ref(false);
// 倒计时
const countdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// 媒体查询
const isMobile = ref(false)
const breakpoint = 768 // 设定断点值，比如768px

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < breakpoint
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  // 恢复登录状态
  loginStore.restoreAuth()
  if (loginStore.isLoggedIn) {
    router.push('/dashboard')
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 表单验证规则
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error(t('loginPage.Enterphone')));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'));
  } else {
    callback();
  }
};

const validateEmail = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error(t('loginPage.EnterEmail')));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error('请输入正确的邮箱格式'));
  } else {
    callback();
  }
};

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error(t('loginPage.EnterPassword')));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error('请再次输入密码'));
  } else if (value !== ruleForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 表单数据
const ruleForm = reactive({
  phoneNumber: "",
  fullname: "",
  email: "",
  identifyingNumber: "",
  password: "",
  confirmPassword: "",
});

// 动态验证规则
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    phoneNumber: [{ validator: validatePass, trigger: "blur" }],
    password: [{ validator: validatePass2, trigger: "blur" }],
  };

  if (loginStore.ifSignUp) {
    return {
      ...baseRules,
      fullname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      email: [{ validator: validateEmail, trigger: "blur" }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }],
    };
  }

  // 忘记密码时需要验证确认密码
  if (loginStore.ifForgot) {
    return {
      ...baseRules,
      confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }],
    };
  }

  return baseRules;
});

// 标题和按钮文本
const loginTitle = computed(() => {
  if (loginStore.ifSignUp) return '注册'
  if (loginStore.ifForgot) return '忘记密码'
  return t('loginPage.WelcomeBack')
});

const submitButtonText = computed(() => {
  if (loginStore.ifSignUp) return '注册'
  if (loginStore.ifForgot) return '重置密码'
  return t('loginPage.Signin')
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (loginStore.ifSignUp) {
          // 注册 - 需要验证码
          const response = await fetch('/api/auth/register-with-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phone: ruleForm.phoneNumber,
              fullname: ruleForm.fullname,
              email: ruleForm.email,
              password: ruleForm.password,
              code: ruleForm.identifyingNumber
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            ElMessage.success('注册成功，请登录');
            loginStore.ifSignUp = false;
            // 清空表单
            ruleForm.identifyingNumber = '';
          } else {
            ElMessage.error(result.message || '注册失败');
          }
        } else if (loginStore.ifForgot) {
          // 忘记密码 - 需要验证码
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phone: ruleForm.phoneNumber,
              code: ruleForm.identifyingNumber,
              newPassword: ruleForm.password
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            ElMessage.success('密码重置成功，请登录');
            loginStore.ifForgot = false;
            loginStore.ifSignUp = false;
            ruleForm.identifyingNumber = '';
            ruleForm.password = '';
            ruleForm.confirmPassword = '';
          } else {
            ElMessage.error(result.message || '密码重置失败');
          }
        } else if (isCodeLogin.value) {
          // 验证码登录
          const response = await fetch('/api/auth/login-with-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phone: ruleForm.phoneNumber,
              code: ruleForm.identifyingNumber
            })
          });
          
          const result = await response.json();
          
          if (result.success && result.data) {
            // 保存登录状态
            loginStore.token = result.data.token;
            loginStore.user = result.data;
            loginStore.isLoggedIn = true;
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data));
            
            ElMessage.success('登录成功');
            // 同步用户数据到 userStore
            userStore.initUser();
            // 连接 Socket.io
            socketService.connect();
            router.push('/dashboard');
          } else {
            ElMessage.error(result.message || '登录失败');
          }
        } else {
          // 密码登录
          await loginStore.login({
            phone: ruleForm.phoneNumber,
            password: ruleForm.password,
          });
          ElMessage.success('登录成功');
          // 同步用户数据到 userStore
          userStore.initUser();
          // 连接 Socket.io
          socketService.connect();
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('操作失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// 切换登录方式
const toggleLoginMode = () => {
  isCodeLogin.value = !isCodeLogin.value;
  // 清空密码和验证码
  ruleForm.password = '';
  ruleForm.identifyingNumber = '';
};

// 获取验证码
const handleGetCode = async () => {
  // 验证手机号
  if (!ruleForm.phoneNumber) {
    ElMessage.warning('请输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(ruleForm.phoneNumber)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  
  // 如果正在倒计时，不处理
  if (countdown.value > 0) return;
  
  try {
    loading.value = true;
    
    // 确定验证码类型
    let codeType = 'login';
    if (loginStore.ifSignUp) {
      codeType = 'register';
    } else if (loginStore.ifForgot) {
      codeType = 'reset';
    }
    
    // 调用发送验证码 API
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: ruleForm.phoneNumber,
        type: codeType
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      ElMessage.success('验证码已发送');
      // 开始倒计时
      countdown.value = 60;
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
          }
        }
      }, 1000);
    } else {
      ElMessage.error(result.message || '发送验证码失败');
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    ElMessage.error('发送验证码失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped lang="scss">
.bigBox {
  width: 100vw;
  display: flex;
  height: 100vh;
}
.left {
  width: 50%;
  height: 100%;
  background-color: #e7eff7d6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.pics {
  width: 400px;
  height: 300px;
  border-radius: 15px;
  overflow: hidden;
  img {
    width: 100%;
  }
}
.texts {
  width: 400px;
  margin-top: 20px;
}
.bigTips {
  font-size: 21px;
  font-weight: 600;
}
.smallTips {
  margin-top: 2px;
  font-size: small;
  color: #909cad;
}
.right {
  width: 50%;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.right_box {
  width: 400px;
}
.form_el {
  margin-top: 20px;
  font-weight: 500;
}
:deep().el-input-group__append,
.el-input-group__prepend {
  background-color: #0e8ee9;
  padding: 0 10px;
  cursor: pointer;
}
:deep().el-input-group__append:hover{
  background-color: #0d84d9;
}
.btn_getCode {
  color: #ffffff;
  cursor: pointer;
  user-select: none;
}
.btn_getCode.btn_disabled {
  color: #a0cfff;
  cursor: not-allowed;
}
.oneLine {
  display: flex;
  justify-content: space-between;
}
.PointStyle {
  color: #3d9ce0;
  cursor: pointer;
}
.btn_sign {
  margin-top: 10px;
  width: 100%;
  height: 40px;
  background-color: #79add2;
}
.btn_sign:hover {
  background-color: #3d9ce0;
}
/* 响应式样式 */
@media (max-width: 768px) {
  .right {
    width: 100%;
  }
}
</style>
