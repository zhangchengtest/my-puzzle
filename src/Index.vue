<template>
  <div>
    <h1>大象</h1>
    <ul class="route-list">
      <li v-for="(route, index) in routes" :key="route.path">
        <span class="number">{{ index + 1 }}</span>
        <router-link :to="route.path">{{ route.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Index',
  data() {
    return {
      routes: []
    };
  },
  created() {
    // 获取所有路由，过滤掉当前页面本身
    this.routes = this.$router.options.routes.filter(r => r.name !== 'Index');
  }
});
</script>

<style scoped>
.route-list {
  list-style: none;
  padding: 0;
}
.route-list li {
  display: flex;
  align-items: center;
  margin: 4px 0;
}
.number {
  display: inline-block;
  width: 2em; /* 固定宽度便于对齐 */
  text-align: right;
  margin-right: 0.5em;
  font-weight: bold;
}
</style>
