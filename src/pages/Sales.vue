<template>
  <div class="sales-page">
    <h1>销售</h1>
    <p class="tip">先选一级菜单（如桌子、椅子、沙发），再选该分类下的规格。</p>

    <div v-if="categories.length === 0" class="empty">
      <p>暂无配置，请先在「家具管理」添加一级菜单和规格。</p>
      <router-link to="/furnituremanage">去家具管理</router-link>
    </div>

    <template v-else>
      <!-- 一级菜单 -->
      <section class="section">
        <label class="field-label">一级菜单</label>
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="['tab', { active: selectedCategoryId === cat.id }]"
            @click="selectCategory(cat.id)"
          >
            <img v-if="cat.image" :src="cat.image" class="cat-thumb" alt="" />
            <span class="tab-name">{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <!-- 当前分类下的规格 key + 下拉（选项含价格） -->
      <section v-if="selectedCategoryId && currentSpecs.length > 0" class="section form">
        <div v-for="spec in currentSpecs" :key="spec.id" class="field">
          <label class="field-label">{{ spec.keyName }}</label>
          <select
            :value="selections[selectedCategoryId]?.[spec.keyName]"
            class="field-select"
            @change="onSpecChange(spec.keyName, $event.target.value)"
          >
            <option value="">请选择</option>
            <option
              v-for="opt in spec.values"
              :key="opt.label"
              :value="opt.label"
            >
              {{ opt.label }} — ￥{{ formatPrice(opt.price) }}
            </option>
          </select>
        </div>
        <div v-if="totalPrice !== null" class="total-row">
          <span class="total-label">当前合计</span>
          <span class="total-price">￥{{ formatPrice(totalPrice) }}</span>
        </div>
        <button v-if="hasSelection" class="btn-clear" @click="clearSelections">清空选择</button>
      </section>
      <p v-else-if="selectedCategoryId" class="empty-hint">该分类下暂无规格配置。</p>
    </template>
  </div>
</template>

<script>
const CONFIG_KEY = 'furniture_config';
const SELECTION_KEY = 'sales_selection';

function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { categories: [], specsByCategory: {} };
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return { categories: [], specsByCategory: {} };
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      specsByCategory: data.specsByCategory && typeof data.specsByCategory === 'object' ? data.specsByCategory : {}
    };
  } catch {
    return { categories: [], specsByCategory: {} };
  }
}

function loadSelections() {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default {
  name: 'Sales',
  data() {
    const { categories, specsByCategory } = loadConfig();
    return {
      categories: categories || [],
      specsByCategory: specsByCategory || {},
      selectedCategoryId: null,
      selections: loadSelections()
    };
  },
  computed: {
    currentSpecs() {
      if (!this.selectedCategoryId) return [];
      const list = this.specsByCategory[this.selectedCategoryId] || [];
      return list.map(s => ({
        ...s,
        values: Array.isArray(s.values) ? s.values.map(v => typeof v === 'object' && v && 'label' in v ? v : { label: String(v), price: 0 }) : []
      }));
    },
    hasSelection() {
      const sel = this.selections[this.selectedCategoryId];
      return sel && Object.values(sel).some(Boolean);
    },
    totalPrice() {
      if (!this.selectedCategoryId || !this.currentSpecs.length) return null;
      const sel = this.selections[this.selectedCategoryId] || {};
      let total = 0;
      for (const spec of this.currentSpecs) {
        const chosen = sel[spec.keyName];
        if (!chosen) continue;
        const opt = (spec.values || []).find(v => v.label === chosen);
        if (opt) total += Number(opt.price) || 0;
      }
      return total;
    }
  },
  methods: {
    formatPrice(p) {
      const n = Number(p);
      return isNaN(n) ? '0.00' : n.toFixed(2);
    },
    selectCategory(id) {
      this.selectedCategoryId = id;
    },
    onSpecChange(keyName, value) {
      if (!this.selectedCategoryId) return;
      if (!this.selections[this.selectedCategoryId]) {
        this.selections[this.selectedCategoryId] = {};
      }
      this.selections[this.selectedCategoryId][keyName] = value;
      this.saveSelections();
    },
    saveSelections() {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(this.selections));
    },
    clearSelections() {
      if (this.selectedCategoryId) {
        this.selections[this.selectedCategoryId] = {};
      }
      this.saveSelections();
    }
  },
  mounted() {
    const { categories, specsByCategory } = loadConfig();
    this.categories = categories || [];
    this.specsByCategory = specsByCategory || {};
    this.selections = loadSelections();
    if (!this.selectedCategoryId && this.categories.length > 0) {
      this.selectedCategoryId = this.categories[0].id;
    }
  },
  activated() {
    const { categories, specsByCategory } = loadConfig();
    this.categories = categories || [];
    this.specsByCategory = specsByCategory || {};
    this.selections = loadSelections();
    if (!this.selectedCategoryId && this.categories.length > 0) {
      this.selectedCategoryId = this.categories[0].id;
    }
  }
};
</script>

<style scoped>
.sales-page {
  padding: 1rem;
  max-width: 480px;
  margin: 0 auto;
  text-align: left;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.tip {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.section {
  margin-bottom: 1.25rem;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tab {
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.tab.active {
  background: #2196f3;
  color: #fff;
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.cat-thumb {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}
.tab-name {
  flex: 0 0 auto;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field-label {
  font-weight: 600;
  font-size: 0.95rem;
}
.field-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
}
.btn-clear {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-start;
}
.btn-clear:hover {
  background: #f57c00;
}
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}
.empty a {
  color: #646cff;
  margin-top: 0.5rem;
  display: inline-block;
}
.empty-hint {
  color: #999;
  font-size: 0.9rem;
}
.total-row {
  margin-top: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #e8f5e9;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-label {
  font-weight: 600;
}
.total-price {
  font-size: 1.15rem;
  color: #2e7d32;
  font-weight: 600;
}
</style>
