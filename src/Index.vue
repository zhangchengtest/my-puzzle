<template>
  <div class="index-page">
    <h1><a href="http://175.24.178.171:8888/">大象</a></h1>
    <p class="version">v{{ appVersion }}</p>

    <div class="genre-row">
      <button
        v-for="c in categoryOptions"
        :key="c"
        :class="['chip', { active: activeCategory === c }]"
        @click="activeCategory = c"
      >{{ c }}</button>
    </div>

    <template v-if="activeCategory === '全部'">
      <section
        v-for="group in groupedRoutes"
        :key="group.name"
        class="category-section"
      >
        <h2 class="category-title">{{ group.name }}</h2>
        <ul class="route-list">
          <li v-for="(route, index) in group.routes" :key="route.path">
            <span class="number">{{ index + 1 }}</span>
            <router-link :to="route.path">{{ displayName(route) }}</router-link>
          </li>
        </ul>
      </section>
    </template>

    <ul v-else class="route-list">
      <li v-for="(route, index) in filteredRoutes" :key="route.path">
        <span class="number">{{ index + 1 }}</span>
        <router-link :to="route.path">{{ displayName(route) }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

/** 路由 name → 分类；未列出的归入「其他」 */
const ROUTE_CATEGORY = {
  Json: '开发',
  JsonToCsv: '开发',
  JsonToTable: '开发',
  SmartSqlBuilder: '开发',
  TableToJava: '开发',
  QuoteFormatter: '开发',
  NumberSum: '开发',
  Color: '开发',
  QRCode: '开发',
  RedBlackTree: '开发',
  WebsiteTag: '开发',
  Tags: '开发',

  QimenDunjia: '命理',
  DaLiuRen: '命理',

  Writing: '创作',
  Novel: '创作',
  Song: '创作',
  Voice: '创作',

  Puzzle: '游戏',
  BilliardLine: '游戏',

  Chat: '聊天',
  ChatMqtt: '聊天',

  Task: '生活',
  Timeline: '生活',
  Downloads: '生活',
  Upload: '生活',
  Coupon: '生活',
  Career: '生活',
  SurgeAssets: '生活',
  ShopBinding: '生活',
};

const CATEGORY_ORDER = ['开发', '命理', '创作', '游戏', '聊天', '生活', '其他'];

const DISPLAY_NAME = {
  Task: '任务中心',
  Puzzle: '拼图挑战',
  NumberSum: '数字求和',
  QimenDunjia: '奇门遁甲',
  DaLiuRen: '大六壬',
  Downloads: '文件管理',
  Career: '简历与面试',
  Chat: '房间聊天',
  ChatMqtt: '房间聊天 MQTT',
  ShopBinding: '模拟电商绑定',
  Writing: '名著知乎文',
  SurgeAssets: '暴涨资产档案',
  SmartSqlBuilder: '智能 SQL',
  QuoteFormatter: '引用格式化',
  JsonToCsv: 'JSON → CSV',
  JsonToTable: 'JSON → 表格',
  TableToJava: '表结构 → Java',
  RedBlackTree: '红黑树',
  BilliardLine: '台球瞄准线',
  WebsiteTag: '网站标签',
  QRCode: '二维码',
  Timeline: '时间线',
};

export default defineComponent({
  name: 'Index',
  data() {
    return {
      routes: [],
      activeCategory: '全部',
      appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
    };
  },
  computed: {
    categoryOptions() {
      const present = new Set(this.routes.map(r => this.categoryOf(r)));
      return ['全部', ...CATEGORY_ORDER.filter(c => present.has(c))];
    },
    filteredRoutes() {
      if (this.activeCategory === '全部') return this.routes;
      return this.routes.filter(r => this.categoryOf(r) === this.activeCategory);
    },
    groupedRoutes() {
      const map = new Map();
      for (const route of this.routes) {
        const cat = this.categoryOf(route);
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat).push(route);
      }
      return CATEGORY_ORDER
        .filter(c => map.has(c))
        .map(name => ({ name, routes: map.get(name) }));
    }
  },
  created() {
    this.routes = this.$router.options.routes.filter(r => r.name !== 'Index');
  },
  methods: {
    categoryOf(route) {
      return ROUTE_CATEGORY[route.name] || '其他';
    },
    displayName(route) {
      return DISPLAY_NAME[route.name] || route.name;
    }
  }
});
</script>

<style scoped>
.index-page {
  max-width: 40em;
}

.version {
  margin: -0.5em 0 1em;
  color: #888;
  font-size: 0.85em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.genre-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1.25em;
}

.chip {
  padding: 7px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.9rem;
}

.chip:hover {
  background: #e8e8e8;
}

.chip.active {
  background: #0066ff;
  color: #fff;
  border-color: #0066ff;
}

.category-section {
  margin-bottom: 1.25em;
}

.category-title {
  margin: 0 0 0.4em;
  font-size: 1rem;
  font-weight: 600;
  color: #444;
}

.route-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.route-list li {
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.number {
  display: inline-block;
  width: 2em;
  text-align: right;
  margin-right: 0.5em;
  font-weight: bold;
}
</style>
