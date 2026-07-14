<template>
  <div class="page-container profile-page">
    <div class="page-header">
      <van-nav-bar title="个人中心" fixed />
    </div>

    <div class="profile-content">
      <!-- 用户信息区域 -->
      <div class="user-info-card" @click="goToLogin">
        <div class="user-avatar">
          <van-image
            width="60"
            height="60"
            round
            fit="cover"
            :src="userInfo.avatar || defaultAvatar"
          />
        </div>
        <div class="user-detail">
          <div class="user-name">{{ userInfo.nickname || "点击登录" }}</div>
          <div class="user-account" v-if="userInfo.account">
            账号：{{ userInfo.account }}
          </div>
        </div>
        <van-icon name="arrow" class="arrow-icon" />
      </div>

      <!-- 功能列表 -->
      <van-cell-group class="function-group" title="常用功能">
        <van-cell title="历史会话" is-link to="/chat-history">
          <template #icon>
            <van-icon name="clock-o" class="cell-icon" />
          </template>
        </van-cell>
        <van-cell title="收藏夹" is-link>
          <template #icon>
            <van-icon name="star-o" class="cell-icon" />
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group class="function-group" title="应用设置">
        <van-cell title="消息通知" is-link>
          <template #icon>
            <van-icon name="bell" class="cell-icon" />
          </template>
          <template #right-icon>
            <van-switch
              v-model="settings.notifications"
              size="20"
              @click.stop
            />
          </template>
        </van-cell>
        <van-cell title="清理缓存" is-link @click="clearCache">
          <template #icon>
            <van-icon name="delete" class="cell-icon" />
          </template>
          <template #value>
            <span class="cache-size">{{ cacheSize }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group class="function-group" title="关于">
        <van-cell title="关于我们" is-link @click="showAbout">
          <template #icon>
            <van-icon name="info-o" class="cell-icon" />
          </template>
        </van-cell>

        <van-cell title="隐私政策" is-link>
          <template #icon>
            <van-icon name="shield-o" class="cell-icon" />
          </template>
        </van-cell>
        <van-cell title="版本信息">
          <template #icon>
            <van-icon name="label-o" class="cell-icon" />
          </template>
          <template #value>
            <span class="version-text">v{{ version }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 退出登录 -->
      <div class="logout-section" v-if="userInfo.isLoggedIn">
        <van-button
          type="default"
          block
          round
          class="logout-btn"
          @click="handleLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>

    <!-- 关于我们弹窗 -->
    <van-popup
      v-model:show="showAboutPopup"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="about-popup">
        <div class="about-header">关于我们</div>
        <div class="about-content">
          <div class="app-name">AI 旅游助手</div>
          <div class="app-desc">
            智能旅行规划助手，基于大语言模型，为您提供个性化的旅行方案、景点推荐、行程规划等服务。
          </div>
          <div class="app-features">
            <div class="feature-title">主要功能</div>
            <ul>
              <li>AI 智能对话，随时解答旅行问题</li>
              <li>个性化行程规划，定制专属旅行方案</li>
              <li>景点推荐，发现更多旅行目的地</li>
              <li>预算估算，合理规划旅行开支</li>
            </ul>
          </div>
          <div class="app-version">版本 {{ version }}</div>
        </div>
      </div>
    </van-popup>

    <!-- 退出登录确认弹窗 -->
    <van-popup
      v-model:show="showLogoutPopup"
      round
      :style="{ width: '80%', padding: '24px' }"
      closeable
      @click-close-icon="showLogoutPopup = false"
    >
      <div class="logout-popup">
        <div class="logout-icon">
          <van-icon name="warning" size="48" color="#ee0a24" />
        </div>
        <div class="logout-title">退出登录</div>
        <div class="logout-message">确定要退出当前账号吗？</div>
        <div class="logout-buttons">
          <van-button
            size="large"
            round
            class="cancel-btn"
            @click="showLogoutPopup = false"
          >
            取消
          </van-button>
          <van-button
            type="danger"
            size="large"
            round
            class="confirm-btn"
            @click="confirmLogout"
          >
            确认退出
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const router = useRouter();

const defaultAvatar = "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg";
const version = "1.0.0";
const cacheSize = ref("2.5 MB");

const userInfo = reactive({
  isLoggedIn: false,
  nickname: "",
  account: "",
  avatar: "",
});

const settings = reactive({
  notifications: true,
});

const showAboutPopup = ref(false);
const showLogoutPopup = ref(false);

// 跳转到登录页
const goToLogin = () => {
  if (!userInfo.isLoggedIn) {
    router.push("/login");
  }
};

// 清理缓存
const clearCache = () => {
  cacheSize.value = "0 KB";
  showToast("缓存已清理");
};

// 显示关于弹窗
const showAbout = () => {
  showAboutPopup.value = true;
};

// 显示退出登录弹窗
const handleLogout = () => {
  showLogoutPopup.value = true;
};

// 确认退出登录
const confirmLogout = () => {
  // 清除用户信息
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
  sessionStorage.removeItem("userInfo");
  sessionStorage.removeItem("token");
  userInfo.isLoggedIn = false;
  userInfo.nickname = "";
  userInfo.account = "";
  userInfo.avatar = "";
  showLogoutPopup.value = false;
  showToast("已退出登录");
};

// 加载用户信息
onMounted(() => {
  // 从 localStorage 或 sessionStorage 获取用户信息
  const storedUser =
    localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    userInfo.isLoggedIn = true;
    userInfo.id = user.id || "";
    userInfo.nickname = user.nickname || "用户";
    userInfo.account = user.account || "";
    userInfo.avatar = user.avatar || "";
  }
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px;
}

.profile-content {
  padding: 12px;
}

.user-info-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #4a90e2 0%, #67a8ff 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-info-card:active {
  opacity: 0.9;
}

.user-avatar {
  flex-shrink: 0;
}

.user-detail {
  flex: 1;
  margin-left: 16px;
  color: #fff;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-account {
  font-size: 13px;
  opacity: 0.9;
}

.arrow-icon {
  color: #fff;
  opacity: 0.8;
}

.function-group {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.cell-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #969799;
}

.cache-size,
.version-text {
  font-size: 13px;
  color: #969799;
}

.logout-section {
  margin-top: 24px;
  padding: 0 16px;
}

.logout-btn {
  border: none;
  background: #fff;
  color: #ee0a24;
}

/* 关于弹窗样式 */
.about-popup {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.about-header {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebedf0;
}

.about-content {
  padding-top: 16px;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
  color: #323233;
}

.app-desc {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
  text-align: justify;
  margin-bottom: 20px;
}

.app-features {
  margin-bottom: 20px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #323233;
}

.app-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.app-features li {
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
  padding-left: 16px;
  position: relative;
}

.app-features li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #4a90e2;
}

.app-version {
  text-align: center;
  font-size: 13px;
  color: #969799;
  padding-top: 16px;
  border-top: 1px solid #ebedf0;
}

/* 退出登录弹窗样式 */
.logout-popup {
  text-align: center;
  padding: 16px 0;
}

.logout-icon {
  margin-bottom: 16px;
}

.logout-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.logout-message {
  font-size: 14px;
  color: #646566;
  margin-bottom: 24px;
  line-height: 1.5;
}

.logout-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logout-buttons .van-button {
  height: 44px;
  font-size: 16px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #646566;
  border: none;
}

.confirm-btn {
  background: linear-gradient(135deg, #ee0a24 0%, #f44 100%);
  border: none;
}
</style>