<script setup>
import { ref } from "vue";
const active = ref(0);
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
  <div class="container">
    <router-view></router-view>
    <van-tabbar
      v-if="['/', '/chat', '/profile'].includes(route.path)"
      v-model="active"
      route
    >
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/chat">对话</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>


