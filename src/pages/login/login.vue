<template>
  <div class="bigBox">
    <div class="left" v-if="!isMobile">
      <div class="pics">
        <img src="../../assets/pics/登录页.png" alt="登录页图片" />
      </div>
      <div class="texts">
        <div class="bigTips">"The clarity needed to move mountains."</div>
        <div class="smallTips">
          Join a workspace designed for focus.Manage projects,
        </div>
        <div class="smallTips">
          collaborate with your team, and ship faster-all in one place.
        </div>
      </div>
    </div>
    <div class="right">
      <div class="right_box">
        <div class="bigTips">Welcome Back</div>
        <div class="smallTips">
          Enter your details to access your workspace.
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
          <el-form-item label="Phone Number" prop="phoneNumber">
            <el-input
              v-model="ruleForm.phoneNumber"
              placeholder="Enter your phone number"
              autocomplete="off"
              :prefix-icon="Iphone"
            />
          </el-form-item>
          <el-form-item
            v-if="loginStore.ifSignUp || loginStore.ifForgot"
            label="Identifying Number"
            prop="identifyingNumber"
          >
            <el-input
              v-model="ruleForm.identifyingNumber"
              placeholder="Enter your identifying number"
              autocomplete="off"
              :prefix-icon="ChatDotRound"
            >
              <template #append>
                <div class="btn_getCode">getCode</div>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="!loginStore.ifForgot"
            label="Password"
            prop="password"
          >
            <el-input
              v-model="ruleForm.password"
              placeholder="Enter your password"
              type="password"
              autocomplete="off"
              :prefix-icon="Lock"
              :show-password="true"
            />
          </el-form-item>
          <div class="smallTips oneLine">
            <div v-if="!loginStore.ifSignUp">
              Don't have an account?
              <span
                class="PointStyle"
                @click="
                  loginStore.ifSignUp = true;
                  loginStore.ifForgot = false;
                "
                >Sign Up</span
              >
            </div>
            <div v-if="loginStore.ifSignUp">
              I already have an account?
              <span
                class="PointStyle"
                @click="
                  loginStore.ifSignUp = false;
                  loginStore.ifForgot = false;
                "
                >Sign in</span
              >
            </div>
            <span
              class="PointStyle"
              @click="
                loginStore.ifForgot = true;
                loginStore.ifSignUp = false;
              "
              >Forgot password?</span
            >
          </div>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm(ruleFormRef)"
              class="btn_sign"
            >
              Sign In
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted  } from "vue";
import { Iphone, Lock, ChatDotRound } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { useLoginStore } from "../../stores/loginStore";
import { useRouter } from "vue-router";
const router = useRouter();
const loginStore = useLoginStore();
const ruleFormRef = ref<FormInstance>();
//媒体查询
const isMobile = ref(false)
const breakpoint = 768 // 设定断点值，比如768px

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < breakpoint
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Please input the phone number"));
  } else {
    if (ruleForm.phoneNumber !== "") {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField("phoneNumber");
    }
    callback();
  }
};
const validatePass1 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Please input the identifying number"));
  } else {
    if (ruleForm.identifyingNumber !== "") {
      if (!ruleFormRef.value) return;
      ruleFormRef.value.validateField("identifyingNumber");
    }
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("Please input the password again"));
  } else {
    callback();
  }
};

const ruleForm = reactive({
  phoneNumber: "",
  identifyingNumber: "",
  password: "",
});

const rules = reactive<FormRules<typeof ruleForm>>({
  phoneNumber: [{ validator: validatePass, trigger: "blur" }],
  identifyingNumber: [{ validator: validatePass1, trigger: "blur" }],
  password: [{ validator: validatePass2, trigger: "blur" }],
});

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      console.log("submit!");
      router.push({
          path:'/dashboard',
        })
    } else {
      console.log("error submit!");
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
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
