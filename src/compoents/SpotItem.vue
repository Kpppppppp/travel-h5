<template>
  <div class="spot-item" v-if="data">
    <div class="spot-name">{{ data.spot || data.name || "待定" }}</div>
    <div
      class="spot-details"
      v-if="data.duration || data.ticket || data.transportation"
    >
      <div class="detail-row" v-if="data.duration">
        <van-icon name="clock-o" size="14" />
        <span>{{ data.duration }}</span>
      </div>
      <div class="detail-row" v-if="data.ticket">
        <van-icon name="ticket-o" size="14" />
        <span>{{ data.ticket }}</span>
      </div>
      <div class="detail-row" v-if="data.transportation">
        <van-icon name="logistics" size="14" />
        <span>{{ data.transportation }}</span>
      </div>
    </div>
    <div class="spot-desc" v-if="data.description">{{ data.description }}</div>
  </div>
  <div class="spot-item empty" v-else>
    <van-empty description="暂无安排" :image-size="40" />
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: null,
  },
});
</script>

<style scoped>
.spot-item {
  padding: 8px 0;
}
.spot-item.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}
.spot-name {
  font-size: 23px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}
.spot-details {
  display: flex;
  /* 间隔 */
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.detail-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #646566;
  margin-bottom: 4px;
}
.detail-row:last-child {
  margin-bottom: 0;
}
.detail-row span {
  margin-left: 4px;
}
.spot-desc {
  font-size: 14px;
  color: #969799;
  line-height: 1.5;
}
</style>