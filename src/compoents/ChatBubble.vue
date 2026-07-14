<template>
  <div v-if="hasContent" class="chat-bubble" :class="messageClass">
    <div class="bubble-content">
      <div class="message-text" v-if="message.role === 'user'">
        {{ message.content }}
      </div>
      <div
        v-else
        class="message-text ai-message"
        v-html="renderedContent"
      ></div>
    </div>
    <div class="message-time" v-if="showTime">{{ formatTime }}</div>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

// 配置 marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

const hasContent = computed(() => {
  return props.message.content && props.message?.content?.trim();
});

const renderedContent = computed(() => {
  if (!props.message.content) return "";
  return marked(props.message.content);
});

const messageClass = computed(() => {
  return props.message.role === "user" ? "user-message" : "ai-message";
});

const showTime = computed(() => {
  return props.message.timestamp && props.message.content;
});

const formatTime = computed(() => {
  if (!props.message.timestamp) return "";
  const date = new Date(props.message.timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
});
</script>

<style scoped>
.chat-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}
.user-message {
  align-self: flex-end;
  align-items: flex-end;
}
.ai-message {
  align-self: flex-start;
  align-items: flex-start;
}
.bubble-content {
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
}
.user-message .bubble-content {
  background: #4687f3;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.ai-message .bubble-content {
  /* background: #fff; */
  color: #323233;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.message-text {
  font-size: 15px;
  line-height: 1.6;
  /* 可以复制 */
  user-select: text;
}
.message-time {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}
.user-message .message-time {
  text-align: right;
}
.ai-message .message-time {
  text-align: left;
}

/* Markdown 渲染样式 */
.ai-message :deep(h1),
.ai-message :deep(h2),
.ai-message :deep(h3),
.ai-message :deep(h4) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  line-height: 1.3;
}
.ai-message :deep(h1) {
  font-size: 1.5em;
}
.ai-message :deep(h2) {
  font-size: 1.3em;
}
.ai-message :deep(h3) {
  font-size: 1.1em;
}
.ai-message :deep(h4) {
  font-size: 1em;
}

.ai-message :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

.ai-message :deep(ul),
.ai-message :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.ai-message :deep(li) {
  margin: 4px 0;
  line-height: 1.6;
}

.ai-message :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: Consolas, Monaco, "Andale Mono", monospace;
  font-size: 0.9em;
}

.ai-message :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.ai-message :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 0.85em;
  line-height: 1.5;
}

.ai-message :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 16px;
  border-left: 4px solid #ddd;
  background: #f9f9f9;
  color: #666;
}

.ai-message :deep(table) {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
}

.ai-message :deep(th),
.ai-message :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.ai-message :deep(th) {
  background: #f5f5f5;
  font-weight: 600;
}

.ai-message :deep(a) {
  color: #1989fa;
  text-decoration: none;
}

.ai-message :deep(hr) {
  border: none;
  border-top: 1px solid #eee;
  margin: 16px 0;
}
</style>