<template>
  <div class="page-container chat-history-page">
    <div class="page-header">
      <van-nav-bar
        left-text="返回"
        left-arrow
        fixed
        @click-left="onBack"
        title="历史会话"
      />
    </div>
    <div class="history-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :immediate-check="false"
          finished-text="没有更多了"
          @load="loadHistory"
        >
          <div
            v-for="item in historyList"
            :key="item.sessionId"
            class="history-item"
            @click="viewDetail(item)"
          >
            <div class="history-info">
              <div class="history-title">{{ formatTitle(item) }}</div>
              <div class="history-time">{{ formatTime(item.updatedAt) }}</div>
            </div>
            <div class="history-actions">
              <van-icon
                name="delete-o"
                size="20"
                @click.stop="confirmDelete(item.sessionId)"
              />
            </div>
          </div>
          <van-empty
            v-if="!loading && historyList.length === 0"
            description="暂无历史会话"
          />
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { get, del } from "../utils/request";
import { showToast, showConfirmDialog } from "vant";

const router = useRouter();

const historyList = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);
const pageSize = 20;

const onBack = () => {
  router.back();
};

const formatTitle = (item) => {
  if (item.firstMessage) {
    return item.firstMessage.length > 30
      ? item.firstMessage.substring(0, 30) + "..."
      : item.firstMessage;
  }
  return "新会话";
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  if (diff < oneDay) {
    return (
      "今天 " +
      date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    );
  } else if (diff < 2 * oneDay) {
    return (
      "昨天 " +
      date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    );
  } else if (diff < oneWeek) {
    const days = Math.floor(diff / oneDay);
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }
};

const loadHistory = async () => {
  // 防止重复加载
  if (loading.value) {
    return;
  }

  loading.value = true;
  try {
    // 从 localStorage 获取 userId
    const storedUser = localStorage.getItem("userInfo");
    if (!storedUser) {
      showToast("请先登录");
      finished.value = true;
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user.id;

    const res = await get("/chat/history", {
      userId: userId,
      page: page.value,
      pageSize,
    });
    if (res && res.data) {
      if (page.value === 1) {
        historyList.value = res.data;
      } else {
        historyList.value = [...historyList.value, ...res.data];
      }
      if (res.data.length < pageSize) {
        finished.value = true;
      }
      page.value++;
    } else {
      finished.value = true;
    }
  } catch (error) {
    showToast("加载历史会话失败");
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onRefresh = async () => {
  page.value = 1;
  finished.value = false;
  loading.value = true;
  await loadHistory();
  refreshing.value = false;
};

const viewDetail = (item) => {
  router.push({
    path: "/chat",
    query: {
      sessionId: item.sessionId,
      title: item.firstMessage || "新会话",
    },
  });
};

const confirmDelete = async (sessionId) => {
  try {
    await showConfirmDialog({
      title: "确认删除",
      message: "确定要删除这个会话吗？删除后无法恢复。",
    });
    await deleteSession(sessionId);
  } catch {
    // 用户取消
  }
};

const deleteSession = async (sessionId) => {
  try {
    // 从 localStorage 获取 userId
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      await del(`/chat/history/${sessionId}?userId=${user.id}`);
    } else {
      await del(`/chat/history/${sessionId}`);
    }
    historyList.value = historyList.value.filter(
      (item) => item.sessionId !== sessionId
    );
    showToast("删除成功");
  } catch (error) {
    showToast("删除失败");
  }
};

onMounted(() => {
  loadHistory();
});
</script>

<style scoped>
.van-popup {
  background: #212331;
}
.chat-history-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px;
}

.history-content {
  padding: 12px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:active {
  background-color: #f7f8fa;
}

.history-info {
  flex: 1;
  overflow: hidden;
}

.history-title {
  font-size: 15px;
  color: #323233;
  line-height: 1.5;
  margin-bottom: 8px;
}

.history-time {
  font-size: 12px;
  color: #969799;
}

.history-actions {
  padding-left: 12px;
  color: #969799;
}

.history-actions:active {
  color: #ee0a24;
}
</style>