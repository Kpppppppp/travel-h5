<template>
  <div class="page-container chat-page">
    <div class="page-header">
      <van-nav-bar
        left-text="返回"
        left-arrow
        fixed
        @click-left="onBack('/')"
        :title="pageTitle"
      >
        <template #right>
          <van-icon name="clock-o" size="20" @click="goToHistory" />
        </template>
      </van-nav-bar>
    </div>
    <div class="chat-container" ref="chatContainer">
      <div v-if="messages.length === 0" class="chat-empty">
        <van-empty description="开始和 AI 助手对话吧！" />
        <div class="quick-questions">
          <div class="quick-title">常见问题</div>
          <van-tag
            v-for="question in quickQuestions"
            :key="question"
            size="large"
            mark
            class="quick-tag"
            @click="hanleClickTag(question)"
          >
            {{ question }}
          </van-tag>
        </div>
      </div>
      <div v-else class="message-list">
        <ChatBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
        <div class="steaming-indicator" v-if="isStreaming">
          <van-loading type="spinner" size="20"
            ><span>AI 正在思考中</span></van-loading
          >
        </div>
      </div>
    </div>
    <div class="chat-input-area">
      <van-field
        v-model="inputMessage"
        placeholder="输入您的问题..."
        :disabled="isStreaming"
        @keyup.enter="sendMessage"
      >
        <template #button>
          <van-button
            type="primary"
            size="small"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
            >发送</van-button
          >
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fetchStream, get } from "../utils/request";
import { showToast } from "vant";
import ChatBubble from "../compoents/ChatBubble.vue";
const router = useRouter();
const route = useRoute();

const chatContainer = ref(null);

// 页面标题
const pageTitle = ref("AI 旅游助手");

// 会话ID
const sessionId = ref("");

// 会话数据
const messages = ref([]);
// 常见问题标签
const quickQuestions = ref([
  "北京有哪些必去的景点？",
  "上海美食推荐",
  "成都三日游攻略",
  "如何选择旅行保险？",
]);
// AI处理中的状态
const isStreaming = ref(false);
// 输入的消息
const inputMessage = ref("");

// 点击返回按钮
const onBack = (path) => {
  router.push(path);
};

// 点击常见问题标签
const hanleClickTag = (question) => {
  inputMessage.value = question;
};

// 跳转到历史会话
const goToHistory = () => {
  router.push("/chat-history");
};

const sendMessage = () => {
  const message = inputMessage.value.trim();
  if (!message || isStreaming.value) {
    return;
  }
  addUserMessage(message);
  inputMessage.value = "";
  fetchAIResponse(message);
};

// 用户发送消息
const addUserMessage = (content) => {
  messages.value.push({
    id: Date.now(),
    role: "user",
    content: content,
    timestamp: new Date().toISOString(),
  });
};
// 获取AI回复
const fetchAIResponse = (userMsg) => {
  isStreaming.value = true;
  messages.value.push({
    id: Date.now() + 1,
    role: "ai",
    content: "",
    timestamp: new Date().toISOString(),
  });

  let fullResponse = "";

  // 获取 userId
  const storedUser = localStorage.getItem("userInfo");
  let userId = null;
  if (storedUser) {
    const user = JSON.parse(storedUser);
    userId = user.id;
  }

  // 发送请求获取AI回复，携带sessionId和userId
  fetchStream(
    "chat",
    {
      message: userMsg,
      sessionId: sessionId.value,
      userId: userId,
    },
    (chunk) => {
      fullResponse += chunk;

      const lastMsg = messages.value[messages.value.length - 1];
      if (lastMsg && lastMsg.role === "ai") {
        lastMsg.content = fullResponse;
      }
      scrollToBottom();
    },
    (result) => {
      // 处理完成，保存sessionId
      if (result && result.sessionId) {
        sessionId.value = result.sessionId;
        console.log("会话ID:", sessionId.value);
      }
      // 如果后端返回的 content 不为空，更新消息内容
      if (result && result.content) {
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg && lastMsg.role === "ai") {
          lastMsg.content = result.content;
        }
      }
      isStreaming.value = false;
      scrollToBottom();
    },
    (errMsg) => {
      const lastMsg = messages.value[messages.value.length - 1];
      if (lastMsg && lastMsg.role === "ai") {
        lastMsg.content = `抱歉，AI发生错误："${errMsg}`;
      }
      isStreaming.value = false;
      showToast("AI 回复失败，请稍后重试");
      scrollToBottom();
    }
  );
};
// 置低的方法
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// 加载历史消息
const loadHistoryMessages = async (sid) => {
  // 获取 userId
  const storedUser = localStorage.getItem("userInfo");
  let userId = null;
  if (storedUser) {
    const user = JSON.parse(storedUser);
    userId = user.id;
  }
  console.log(sid);

  try {
    const res = await get(`/chat/history`, { userId: userId, sessionId: sid });
    console.log(res.data);

    if (res.data && res.data.messages) {
      messages.value = res.data.messages.map((msg) => ({
        id: Date.now() + Math.random(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));
      sessionId.value = sid;
      nextTick(() => scrollToBottom());
    }
  } catch (error) {
    showToast("加载历史消息失败");
  }
};

onMounted(() => {
  // 从详情页跳转过来
  if (route.query.scene == "detail" && route.query.city) {
    inputMessage.value = `我想了解一下${route.query.city}的旅游景点`;
  }
  // 从历史会话跳转过来
  else if (route.query.sessionId) {
    // 设置页面标题
    if (route.query.title) {
      pageTitle.value =
        route.query.title.length > 15
          ? route.query.title.substring(0, 15) + "..."
          : route.query.title;
    }
    loadHistoryMessages(route.query.sessionId);
  }
});
</script>

<style scoped>
.page-header {
  height: 46px;
}
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-bottom: 120px;
  box-sizing: border-box;
}
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.quick-questions {
  margin-top: 32px;
  text-align: center;
}
.quick-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}
.quick-tag {
  margin: 8px;
  cursor: pointer;
}
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #999;
  font-size: 14px;
}
.chat-input-area {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  margin: 0 auto;
}
.chat-input-area :deep(.van-field) {
  border-radius: 20px;
  background: #f7f8fa;
  padding: 8px 16px;
}
</style>