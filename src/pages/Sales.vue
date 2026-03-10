<template>
  <div class="sales-page">
    <h1>销售</h1>
    <p class="tip">先选一级菜单（如桌子、椅子、沙发），再选该分类下的规格。</p>

    <div v-if="categories.length === 0" class="empty">
      <p>暂无配置，请先在「家具管理」添加一级菜单和规格。</p>
      <router-link to="/furnituremanage">去家具管理</router-link>
    </div>

    <template v-else>
      <!-- 一级菜单（平铺，可多选） -->
      <section class="section">
        <label class="field-label">一级菜单（可多选）</label>
        <div class="category-grid">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            :class="['category-tile', { active: selectedCategoryIds.includes(cat.id) }]"
            @click="toggleCategory(cat.id)"
          >
            <img v-if="cat.image" :src="cat.image" class="cat-thumb" alt="" />
            <span class="tile-name">{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <!-- 每个已选分类下的规格 -->
      <template v-for="catId in selectedCategoryIds" :key="catId">
        <section v-if="getSpecsByCategoryId(catId).length > 0" class="section form category-form">
          <h3 class="category-form-title">{{ getCategoryName(catId) }}</h3>
          <div v-for="spec in getSpecsByCategoryId(catId)" :key="spec.id" class="field">
            <label class="field-label">{{ spec.keyName }}</label>
            <select
              :value="selections[catId]?.[spec.keyName]"
              class="field-select"
              @change="onSpecChange(catId, spec.keyName, $event.target.value)"
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
        </section>
        <p v-else class="empty-hint">「{{ getCategoryName(catId) }}」暂无规格配置。</p>
      </template>

      <section v-if="selectedCategoryIds.length > 0" class="section summary">
        <div v-if="totalPrice !== null" class="total-row">
          <span class="total-label">当前合计</span>
          <span class="total-price">￥{{ formatPrice(totalPrice) }}</span>
        </div>
        <button v-if="hasSelection" class="btn-clear" @click="clearSelections">清空选择</button>
      </section>
    </template>
  </div>
</template>

<script>
const CONFIG_KEY = 'furniture_config';
const SELECTION_KEY = 'sales_selection';
const SELECTED_IDS_KEY = 'sales_selected_category_ids';

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

function loadSelectedIds() {
  try {
    const raw = localStorage.getItem(SELECTED_IDS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default {
  name: 'Sales',
  data() {
    const { categories, specsByCategory } = loadConfig();
    return {
      categories: categories || [],
      specsByCategory: specsByCategory || {},
      selectedCategoryIds: loadSelectedIds(),
      selections: loadSelections()
    };
  },
  computed: {
    hasSelection() {
      return this.selectedCategoryIds.some(catId => {
        const sel = this.selections[catId];
        return sel && Object.values(sel).some(Boolean);
      });
    },
    totalPrice() {
      if (!this.selectedCategoryIds.length) return null;
      let total = 0;
      for (const catId of this.selectedCategoryIds) {
        const specs = this.getSpecsByCategoryId(catId);
        const sel = this.selections[catId] || {};
        for (const spec of specs) {
          const chosen = sel[spec.keyName];
          if (!chosen) continue;
          const opt = (spec.values || []).find(v => v.label === chosen);
          if (opt) total += Number(opt.price) || 0;
        }
      }
      return total;
    }
  },
  methods: {
    formatPrice(p) {
      const n = Number(p);
      return isNaN(n) ? '0.00' : n.toFixed(2);
    },
    getCategoryName(catId) {
      const cat = this.categories.find(c => c.id === catId);
      return cat ? cat.name : '';
    },
    getSpecsByCategoryId(catId) {
      const list = this.specsByCategory[catId] || [];
      return list.map(s => ({
        ...s,
        values: Array.isArray(s.values) ? s.values.map(v => typeof v === 'object' && v && 'label' in v ? v : { label: String(v), price: 0 }) : []
      }));
    },
    toggleCategory(id) {
      const idx = this.selectedCategoryIds.indexOf(id);
      if (idx === -1) {
        this.selectedCategoryIds.push(id);
      } else {
        this.selectedCategoryIds.splice(idx, 1);
      }
      localStorage.setItem(SELECTED_IDS_KEY, JSON.stringify(this.selectedCategoryIds));
    },
    onSpecChange(catId, keyName, value) {
      if (!this.selections[catId]) {
        this.selections[catId] = {};
      }
      this.selections[catId][keyName] = value;
      this.saveSelections();
    },
    saveSelections() {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(this.selections));
    },
    clearSelections() {
      for (const catId of this.selectedCategoryIds) {
        this.selections[catId] = {};
      }
      this.saveSelections();
    }
  },
  mounted() {
    const { categories, specsByCategory } = loadConfig();
    this.categories = categories || [];
    this.specsByCategory = specsByCategory || {};
    this.selections = loadSelections();
    const ids = loadSelectedIds();
    this.selectedCategoryIds = ids.filter(id => this.categories.some(c => c.id === id));
    if (this.selectedCategoryIds.length !== ids.length) {
      localStorage.setItem(SELECTED_IDS_KEY, JSON.stringify(this.selectedCategoryIds));
    }
  },
  activated() {
    const { categories, specsByCategory } = loadConfig();
    this.categories = categories || [];
    this.specsByCategory = specsByCategory || {};
    this.selections = loadSelections();
    const ids = loadSelectedIds();
    this.selectedCategoryIds = ids.filter(id => this.categories.some(c => c.id === id));
  }
};
</script>

<style scoped>
.sales-page {
  padding: 1rem;
  max-width: 720px;
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
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}
.category-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 0.5rem;
  background: #e0e0e0;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.category-tile:hover {
  background: #d0d0d0;
}
.category-tile.active {
  background: #bbdefb;
  border-color: #2196f3;
  color: #1565c0;
}
.cat-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.tile-name {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
}
.category-form {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}
.category-form-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #333;
}
.summary {
  margin-top: 1rem;
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
