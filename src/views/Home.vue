<template>
  <div class="page-container">
    <div class="page-header">
      <van-nav-bar title="智能旅游助手" />
    </div>
    <div class="page-content">
      <van-notice-bar
        left-icon="info-o"
        text="基于AI的智能景点介绍与行程规划系统"
        style="margin-bottom: 16px"
      />
      <div class="card search-card">
        <div class="section-title">规划你的旅程</div>
        <van-field
          @click="showCityPicker = true"
          v-model="formData.city"
          label="目的地"
          placeholder="请选择城市"
          is-link
          readonly
          style="background: #f7f8fa; border-radius: 8px; margin-bottom: 12px"
        />
        <van-field
          v-model="formData.budget"
          label="预算"
          placeholder="请输入预算"
          type="number"
          :border="false"
          style="background: #f7f8fa; border-radius: 8px; margin-bottom: 12px"
        />
        <van-field
          v-model="formData.days"
          label="天数"
          placeholder="请输入旅行天数"
          type="digit"
          :border="false"
          style="background: #f7f8fa; border-radius: 8px; margin-bottom: 12px"
        />
        <van-button
          type="primary"
          size="large"
          round
          :loading="isLoading"
          block
          @click="handleSubmit"
          >开始规划</van-button
        >
      </div>
      <div class="card quick-actions">
        <div class="section-title">快捷入口</div>
        <van-grid gutter="12" column-num="2">
          <van-grid-item icon="chat-o" @click="goPage('/chat')" text="AI对话" />
          <van-grid-item
            icon="user-o"
            @click="goPage('/profile')"
            text="我的"
          />
        </van-grid>
      </div>
      <div class="card">
        <div class="section-title">热门目的地</div>
        <van-grid gutter="12" column-num="4">
          <van-grid-item
            @click="selectedCity(city)"
            v-for="city in popularCities"
            :key="city"
            ><div :class="{ active: city === formData.city }" class="city-tag">
              {{ city }}
            </div></van-grid-item
          >
        </van-grid>
      </div>
    </div>
    <van-popup
      round
      v-model:show="showCityPicker"
      position="bottom"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <van-picker
        :columns="columns"
        title="选择目的地"
        @confirm="handleConfirm"
        @cancel="showCityPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const router = useRouter();
// 旅游规划表单数据
const formData = reactive({
  city: "",
  budget: null,
  days: null,
});
// 城市选择器是否显示
const showCityPicker = ref(false);
const isLoading = ref(false);
// 城市选择器数据
const columns = ref([
  {
    text: "北京",
    value: "北京",
  },
  {
    text: "上海",
    value: "上海",
  },
  {
    text: "广州",
    value: "广州",
  },
  {
    text: "深圳",
    value: "深圳",
  },
  {
    text: "成都",
    value: "成都",
  },
  {
    text: "西安",
    value: "西安",
  },
  {
    text: "重庆",
    value: "重庆",
  },
  {
    text: "杭州",
    value: "杭州",
  },
  {
    text: "南京",
    value: "南京",
  },
  {
    text: "苏州",
    value: "苏州",
  },
  {
    text: "无锡",
    value: "无锡",
  },
]);

const popularCities = ref([
  "北京",
  "上海",
  "广州",
  "深圳",
  "成都",
  "西安",
  "重庆",
  "杭州",
]);
// 城市选择器确认回调
const handleConfirm = ({ selectedOptions }) => {
  formData.city = selectedOptions[0].value;
  showCityPicker.value = false;
};

const handleSubmit = async () => {
  // isLoading.value = true;
  // 判断目的地
  if (!formData.city) {
    showToast("请选择目的地");
    return;
  }
  // 判断预算
  if (!formData.budget || formData.budget < 100) {
    showToast("预算不能小于100元");
    return;
  }
  // 判断天数
  if (!formData.days || formData.days < 1 || formData.days > 30) {
    showToast("旅行天数必须在1到30天之间");
    return;
  }
  router.push({
    path: "/detail",
    query: {
      city: formData.city,
      days: formData.days,
      budget: formData.budget,
    },
  });

  isLoading.value = false;
};

const goPage = (path) => {
  router.push(path);
};

// 选择热门目的地
const selectedCity = (city) => {
  formData.city = city;
};
</script>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
.city-tag {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  background-color: #f7f8fa;
  transition: all 0.3s;
}
.active {
  background-color: #007aff;
  color: #fff;
}
</style>