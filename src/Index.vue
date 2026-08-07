<template>
  <div>
    <h1><a href="http://175.24.178.171:8888/">大象</a></h1>
    <p class="version">v{{ appVersion }}</p>
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
      routes: [],
      appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
    };
  },
  created() {
    // 获取所有路由，过滤掉当前页面本身
    this.routes = this.$router.options.routes.filter(r => r.name !== 'Index');
  }
});
</script>

<style scoped>
.version {
  margin: -0.5em 0 1em;
  color: #888;
  font-size: 0.85em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
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
