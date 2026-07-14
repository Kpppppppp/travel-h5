<template>
  <div class="budget-table">
    <van-cell-group :border="false">
      <van-cell
        v-for="(value, key) in budgetItems"
        :key="key"
        :title="getLabel(key)"
        :value="'¥' + value"
        :border="false"
      />
    </van-cell-group>
    <div class="budget-total">
      <span>总计</span>
      <span class="total-amount">¥{{ total }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const budgetItems = computed(() => props.data);

const labelMap = {
  accommodation: "住宿",
  transportation: "交通",
  food: "餐饮",
  ticket: "门票",
  shopping: "购物",
  other: "其他",
};

const getLabel = (key) => {
  return labelMap[key] || key;
};

const total = computed(() => {
  return Object.values(props.data).reduce(
    (sum, val) => sum + Number(val || 0),
    0
  );
});
</script>

<style scoped>
.budget-table {
  background: #fff;
  border-radius: 8px;
  padding: 0 16px;
}
.budget-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px dashed #ebedf0;
  margin-top: 8px;
  border-radius: 8px;
  background: #f5f5f5;
}
.budget-total span:first-child {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
}
.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #ee0a24;
}
</style>