<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 正在检查登录状态 -->
    <div v-if="checkingToken" class="checking-status">
      <van-loading size="32px" color="#fff" />
    </div>

    <div v-else class="login-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <van-icon name="chat-o" size="48" color="#fff" />
        </div>
        <h1 class="app-title">AI 旅游助手</h1>
        <p class="app-slogan">智能规划，畅游世界</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <!-- 登录方式切换 -->
        <van-tabs v-model:active="loginType" shrink>
          <van-tab title="账号登录" name="account"></van-tab>
          <van-tab title="短信登录" name="sms"></van-tab>
        </van-tabs>

        <!-- 账号登录 -->
        <div v-if="loginType === 'account'" class="form-content">
          <van-form @submit="handleLogin">
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
                :rules="[{ required: true, message: '请输入密码' }]"
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
                loading-text="登录中..."
              >
                登 录
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 短信登录 -->
        <div v-if="loginType === 'sms'" class="form-content">
          <van-form @submit="handleSmsLogin">
            <van-cell-group inset>
              <van-field
                v-model="smsForm.phone"
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
                v-model="smsForm.code"
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
            </van-cell-group>

            <div class="submit-btn">
              <van-button
                type="primary"
                block
                round
                native-type="submit"
                :loading="loading"
                loading-text="登录中..."
              >
                登 录
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 注册入口 -->
        <div class="register-link">
          还没有账号？
          <span @click="goToRegister">立即注册</span>
        </div>
      </div>

      <!-- 用户协议 -->
      <div class="agreement-text">
        登录即表示同意
        <span class="link" @click="showAgreement('user')">《用户协议》</span>
        和
        <span class="link" @click="showAgreement('privacy')">《隐私政策》</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { post } from "../utils/request";

const router = useRouter();

// 登录方式
const loginType = ref("account");
const loading = ref(false);

// 是否正在检查 Token（防止重复检查）
const checkingToken = ref(true);

// 账号登录表单
const accountForm = reactive({
  username: "",
  password: "",
});

// 短信登录表单
const smsForm = reactive({
  phone: "",
  code: "",
});

// 验证码倒计时
const countdown = ref(0);
let countdownTimer = null;

// 检查是否已登录（自动登录）
onMounted(() => {
  // 先检查 sessionStorage（当前会话）
  let token = sessionStorage.getItem("token");
  let userInfo = sessionStorage.getItem("userInfo");

  // 再检查 localStorage（记住登录）
  if (!token) {
    const localToken = localStorage.getItem("token");
    const localTokenTime = localStorage.getItem("tokenTime");

    // 检查 localStorage 中的 token 是否过期（7天）
    if (localToken && localTokenTime) {
      const now = Date.now();
      const expireTime = 7 * 24 * 60 * 60 * 1000; // 7天
      if (now - parseInt(localTokenTime) <= expireTime) {
        token = localToken;
        userInfo = localStorage.getItem("userInfo");
      } else {
        // 已过期，清除
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("tokenTime");
      }
    }
  }

  // 如果有有效的 token，直接跳转
  if (token && userInfo) {
    router.replace("/");
  }

  checkingToken.value = false;
});

// 发送验证码
const sendCode = () => {
  if (!smsForm.phone) {
    showToast("请输入手机号");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    showToast("手机号格式错误");
    return;
  }

  // 模拟发送验证码
  showToast("验证码已发送");
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

// 账号登录
const handleLogin = async () => {
  loading.value = true;
  try {
    const res = await post("/login", {
      username: accountForm.username,
      password: accountForm.password,
    });

    // 保存用户信息和 token 到 localStorage（7天有效期）
    const userInfo = {
      isLoggedIn: true,
      id: res.user.id,
      nickname: res.user.username,
      account: res.user.username,
      avatar: "",
    };

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("token", res.token);
    localStorage.setItem("tokenTime", Date.now().toString());

    showToast("登录成功");
    router.replace("/");
  } catch (error) {
    const msg = error?.error || error?.message || "登录失败，请重试";
    showToast(msg);
  } finally {
    loading.value = false;
  }
};

// 短信登录
const handleSmsLogin = async () => {
  loading.value = true;
  try {
    // 模拟登录请求
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 保存用户信息到 localStorage（7天有效期）
    const userInfo = {
      isLoggedIn: true,
      nickname: smsForm.phone,
      account: smsForm.phone,
      avatar: "",
    };

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("token", "sms_token_" + Date.now());
    localStorage.setItem("tokenTime", Date.now().toString());

    showToast("登录成功");
    router.replace("/");
  } catch (error) {
    console.log("登录错误:", error);
    showToast(error.error || error.message || "登录失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 跳转到注册页
const goToRegister = () => {
  router.push("/register");
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
.login-page {
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

/* 登录容器 */
.login-container {
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
  margin-bottom: 40px;
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
  font-size: 28px;
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

/* 登录表单 */
.login-form {
  background: #fff;
  border-radius: 16px;
  padding: 24px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.form-content {
  margin-top: 24px;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 16px;
  font-size: 13px;
  color: #646566;
}

.forgot-link {
  color: #4a90e2;
}

/* 提交按钮 */
.submit-btn {
  margin: 24px 16px 16px;
}

/* 注册入口 */
.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #969799;
}

.register-link span {
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