<template>
  <div>
    <h1>路由列表</h1>
    <ul>
      <li v-for="route in routes" :key="route.path">
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
    // 获取所有路由，过滤掉自己（Index）
    this.routes = this.$router.options.routes.filter(r => r.name !== 'Index');
  }
});
</script>