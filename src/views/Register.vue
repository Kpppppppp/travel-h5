<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="register-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <van-icon name="user-o" size="48" color="#fff" />
        </div>
        <h1 class="app-title">用户注册</h1>
        <p class="app-slogan">加入我们，开始智能旅行</p>
      </div>

      <!-- 注册表单 -->
      <div class="register-form">
        <!-- 注册方式切换 -->
        <van-tabs v-model:active="registerType" shrink>
          <van-tab title="账号注册" name="account"></van-tab>
          <van-tab title="手机注册" name="phone"></van-tab>
        </van-tabs>

        <!-- 账号注册 -->
        <div v-if="registerType === 'account'" class="form-content">
          <van-form @submit="handleAccountRegister">
            <van-cell-group inset>
              <van-field
                v-model="accountForm.username"
                name="username"
                label=""
                placeholder="请输入用户名"
                :rules="[{ required: true, message: '请输入用户名' }]"
              >
                <template #left-icon>
                  <van-icon name="user-o" size="20" color="#969799" />
                </template>
              </van-field>

              <van-field
                v-model="accountForm.password"
                type="password"
                name="password"
                label=""
                placeholder="请输入密码"
                :rules="[
                  { required: true, message: '请输入密码' },
                  { pattern: /^.{6,}$/, message: '密码至少6位' },
                ]"
              >
                <template #left-icon>
                  <van-icon name="lock" size="20" color="#969799" />
                </template>
              </van-field>

              <van-field
                v-model="accountForm.confirmPassword"
                type="password"
                name="confirmPassword"
                label=""
                placeholder="请确认密码"
                :rules="[
                  { required: true, message: '请确认密码' },
                  {
                    validator: validateConfirmPassword,
                    message: '两次密码输入不一致',
                  },
                ]"
              >
                <template #left-icon>
                  <van-icon name="shield-o" size="20" color="#969799" />
                </template>
              </van-field>
            </van-cell-group>

            <div class="submit-btn">
              <van-button
                type="primary"
                block
                round
                native-type="submit"
                :loading="loading"
                loading-text="注册中..."
              >
                注 册
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 手机注册 -->
        <div v-if="registerType === 'phone'" class="form-content">
          <van-form @submit="handlePhoneRegister">
            <van-cell-group inset>
              <van-field
                v-model="phoneForm.phone"
                type="tel"
                name="phone"
                label=""
                placeholder="请输入手机号"
                :rules="[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' },
                ]"
              >
                <template #left-icon>
                  <van-icon name="phone-o" size="20" color="#969799" />
                </template>
              </van-field>

              <van-field
                v-model="phoneForm.code"
                type="digit"
                name="code"
                label=""
                placeholder="请输入验证码"
                :rules="[{ required: true, message: '请输入验证码' }]"
              >
                <template #left-icon>
                  <van-icon name="shield-o" size="20" color="#969799" />
                </template>
                <template #button>
                  <van-button
                    size="small"
                    type="default"
                    :disabled="countdown > 0"
                    @click="sendCode"
                    class="send-code-btn"
                  >
                    {{ countdown > 0 ? `${countdown}s` : "发送验证码" }}
                  </van-button>
                </template>
              </van-field>

              <van-field
                v-model="phoneForm.password"
                type="password"
                name="password"
                label=""
                placeholder="请设置密码"
                :rules="[
                  { required: true, message: '请设置密码' },
                  { pattern: /^.{6,}$/, message: '密码至少6位' },
                ]"
              >
                <template #left-icon>
                  <van-icon name="lock" size="20" color="#969799" />
                </template>
              </van-field>
            </van-cell-group>

            <div class="submit-btn">
              <van-button
                type="primary"
                block
                round
                native-type="submit"
                :loading="loading"
                loading-text="注册中..."
              >
                注 册
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 登录入口 -->
        <div class="login-link">
          已有账号？
          <span @click="goToLogin">立即登录</span>
        </div>
      </div>

      <!-- 用户协议 -->
      <div class="agreement-text">
        注册即表示同意
        <span class="link" @click="showAgreement('user')">《用户协议》</span>
        和
        <span class="link" @click="showAgreement('privacy')">《隐私政策》</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { post } from "../utils/request";

const router = useRouter();

// 注册方式
const registerType = ref("account");
const loading = ref(false);

// 账号注册表单
const accountForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
});

// 手机注册表单
const phoneForm = reactive({
  phone: "",
  code: "",
  password: "",
});

// 验证码倒计时
const countdown = ref(0);
let countdownTimer = null;

// 验证确认密码
const validateConfirmPassword = (value) => {
  return value === accountForm.password;
};

// 发送验证码
const sendCode = () => {
  if (!phoneForm.phone) {
    showToast("请输入手机号");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    showToast("手机号格式错误");
    return;
  }

  showToast("验证码已发送");
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

// 账号注册
const handleAccountRegister = async () => {
  if (accountForm.password !== accountForm.confirmPassword) {
    showToast("两次密码输入不一致");
    return;
  }

  loading.value = true;
  try {
    const res = await post("/register", {
      username: accountForm.username,
      password: accountForm.password,
    });

    if (res.success) {
      showToast("注册成功");
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } else {
      showToast(res.message || "注册失败");
    }
  } catch (error) {
    showToast(error.response?.data?.message || "注册失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 手机注册
const handlePhoneRegister = async () => {
  loading.value = true;
  try {
    const res = await post("/register", {
      phone: phoneForm.phone,
      code: phoneForm.code,
      password: phoneForm.password,
    });

    if (res.success) {
      showToast("注册成功");
      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    } else {
      showToast(res.message || "注册失败");
    }
  } catch (error) {
    showToast(error.response?.data?.message || "注册失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页
const goToLogin = () => {
  router.replace("/login");
};

// 显示协议
const showAgreement = (type) => {
  if (type === "user") {
    showToast("用户协议内容");
  } else {
    showToast("隐私政策内容");
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 20%;
  left: -80px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  right: 20%;
}

/* 注册容器 */
.register-container {
  position: relative;
  z-index: 1;
  padding: 40px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.app-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.app-slogan {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  letter-spacing: 1px;
}

/* 注册表单 */
.register-form {
  background: #fff;
  border-radius: 16px;
  padding: 24px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.form-content {
  margin-top: 24px;
}

/* 提交按钮 */
.submit-btn {
  margin: 24px 16px 16px;
}

/* 登录入口 */
.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #969799;
}

.login-link span {
  color: #4a90e2;
  margin-left: 4px;
}

/* 发送验证码按钮 */
.send-code-btn {
  height: 32px;
  line-height: 30px;
  font-size: 12px;
}

/* 协议文本 */
.agreement-text {
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.agreement-text .link {
  color: #fff;
  text-decoration: underline;
}

/* Vant 组件样式覆盖 */
:deep(.van-tabs__nav) {
  background: transparent;
}

:deep(.van-tab) {
  color: #969799;
  font-size: 15px;
}

:deep(.van-tab--active) {
  color: #4a90e2;
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background: #4a90e2;
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

:deep(.van-field) {
  padding: 16px;
}

:deep(.van-field__control) {
  font-size: 15px;
}
</style>