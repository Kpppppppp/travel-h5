<template>
  <div class="page-container">
    <div class="page-header">
      <van-nav-bar
        left-text="返回"
        left-arrow
        fixed
        @click-left="onBack('/')"
        :title="formData.city + '行程规划'"
      />
    </div>
    <div class="page-content">
      <div v-if="isLoading" class="loading-container">
        <van-loading size="48px" type="spinner" />
        <p class="loading-text">{{ status }}</p>
      </div>
      <div v-else-if="errorMsg">
        <van-empty :description="errorMsg">
          <van-button type="primary" @click="fetchTripData">重试</van-button>
        </van-empty>
      </div>
      <template v-else-if="tripData && tripData.success !== false">
        <div class="card overview-card">
          <div class="trip-header">
            <h2>{{ formData.city }} · {{ tripData.days }}行程</h2>
            <span class="trip-budget">预算：{{ tripData.totalBudget }}元</span>
          </div>
        </div>
        <van-collapse v-model="activeDays" class="trip-collapse">
          <van-collapse-item
            v-for="day in tripData.dailyItinerary"
            :key="day.day"
            :title="'第' + day.day + '天'"
            :name="day.day"
          >
            <div class="day-schedule">
              <div class="schedule-section">
                <div class="section-label morning">上午</div>
                <SpotItem :data="day.morning" />
              </div>
              <div class="schedule-section">
                <div class="section-label afternoon">下午</div>
                <SpotItem :data="day.afternoon" />
              </div>
              <div class="schedule-section">
                <div class="section-label evening">晚上</div>
                <SpotItem :data="day.evening" />
              </div>
            </div>
          </van-collapse-item>
          <div class="card budget-card" v-if="tripData.budgetBreakdown">
            <div class="budget-header">
              <div class="section-title">预算明细</div>
            </div>
            <BudgetTable
              :data="tripData.budgetBreakdown"
              :total="tripData.totalBudget"
            />
          </div>
          <div
            class="card tips-card"
            v-if="tripData.tips && tripData.tips.length"
          >
            <div class="section-title">温馨提示</div>
            <ul class="tips-list">
              <li v-for="(tip, index) in tripData.tips" :key="index">
                {{ tip }}
              </li>
            </ul>
          </div>
          <div
            class="card warnings-card"
            v-if="tripData.warnings && tripData.warnings.length"
          >
            <div class="section-title">注意事项</div>
            <ul class="warnings-list">
              <li v-for="(warning, index) in tripData.warnings" :key="index">
                {{ warning }}
              </li>
            </ul>
          </div>
        </van-collapse>
      </template>
    </div>
    <div class="detail-footer" v-if="tripData && tripData.success !== false">
      <van-button
        type="primary"
        size="large"
        @click="goToChat"
        class="primary-button"
        >咨询AI助手</van-button
      >
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { post, get } from "../utils/request";
import SpotItem from "../compoents/SpotItem.vue";
import BudgetTable from "../compoents/BudgetTable.vue";
const route = useRoute();
const router = useRouter();
// 加载状态
const isLoading = ref(true);
const status = ref("正在生成推荐行程...");
const formData = reactive({
  city: "",
  budget: null,
  days: null,
});
const tripData = ref(null);
const errorMsg = ref("");
// 活跃天数
const activeDays = ref([]);

// 获取 userId
const getUserId = () => {
  const storedUser = localStorage.getItem("userInfo");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user.id;
  }
  return null;
};

// 行程规划（使用队列轮询）
const fetchTripData = async () => {
  errorMsg.value = "";
  isLoading.value = true;
  status.value = "正在生成推荐行程...";
  tripData.value = null;

  try {
    // 1. 发起请求，获取 requestId
    const res = await post("recommend", {
      city: formData.city,
      budget: formData.budget,
      days: formData.days,
      userId: getUserId(),
    });

    if (!res || res.success === false) {
      throw new Error(res?.error || "生成失败");
    }

    const { requestId } = res;

    // 2. 轮询结果
    const poll = async () => {
      try {
        const data = await get(`recommend/result/${requestId}`);
        console.log("轮询结果:", data);

        if (data.status === "completed") {
          tripData.value = data.result;
          isLoading.value = false;
          status.value = "";
        } else if (data.status === "failed") {
          errorMsg.value = data.error || "生成失败";
          isLoading.value = false;
        } else {
          status.value = `AI助手正在生成中... (${data.queuePosition || "?"})`;
          setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error("轮询出错:", error);
        isLoading.value = false;
        errorMsg.value = "获取结果失败";
      }
    };
    poll();
  } catch (error) {
    isLoading.value = false;
    status.value = "";
    errorMsg.value = error.message || "生成失败";
  }
};
onMounted(() => {
  formData.city = route.query.city || "";
  formData.budget = route.query.budget || null;
  formData.days = route.query.days || null;

  if (formData.city && formData.budget && formData.days) {
    fetchTripData();
  }
});

const onBack = (path) => {
  router.push(path);
};

const goToChat = () => {
  router.push({
    path: "/chat",
    query: {
      city: formData.city,
      scene: "detail",
    },
  });
};
</script>
<style scoped>
.page-header {
  height: 46px;
}
.overview-card {
  margin-bottom: 16px;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
}
.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.trip-header h2 {
  font-size: 20px;
  color: #323233;
  margin: 0;
}
.trip-budget {
  font-size: 16px;
  color: #ee0a24;
  font-weight: 600;
}
.trip-collapse {
  margin-bottom: 16px;
}
.day-schedule {
  padding: 8px 0;
}
.schedule-section {
  margin-bottom: 16px;
}
.schedule-section:last-child {
  margin-bottom: 0px;
}
.section-label {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}
.section-label.morning {
  background: #fff7e6;
  color: #fa8c16;
}
.section-label.afternoon {
  background: #e6f7ff;
  color: #1890ff;
}
.section-label.evening {
  background: #f6ffed;
  color: #52c41a;
}
.budget-card,
.tips-card,
.warnings-card {
  margin-bottom: 16px;
}
.tips-list,
.warnings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tips-list li,
.warnings-list li {
  padding: 8px 0;
  color: #666;
  font-size: 16px;
  border-bottom: 1px solid #ebedf0;
}
.tips-list li:last-child,
.warnings-list li:last-child {
  border-bottom: none;
}
.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  max-width: 750px;
  margin: 0 auto;
}
.error-card {
  text-align: center;
  padding: 40px 16px;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}
</style>
