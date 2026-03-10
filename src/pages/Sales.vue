<template>
  <div class="sales-page">
    <div class="main-wrap">
      <h1>销售</h1>
      <p class="tip">先选一级菜单（如桌子、椅子、沙发），再选该分类下的规格。</p>

      <div v-if="categories.length === 0" class="empty">
      <p>暂无配置，请先在「家具管理」添加一级菜单和规格。</p>
      <router-link to="/furnituremanage">去家具管理</router-link>
    </div>

    <template v-else>
      <!-- 一级菜单（平铺，点击哪个就展示哪个的属性） -->
      <section class="section">
        <label class="field-label">一级菜单（点击展示该分类规格）</label>
        <div class="category-grid">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            :class="['category-tile', { active: activeCategoryId === cat.id }]"
            @click="selectCategory(cat.id)"
          >
            <img v-if="cat.image" :src="cat.image" class="cat-thumb" alt="" />
            <span class="tile-name">{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <!-- 仅展示当前选中分类的规格 -->
      <section v-if="activeCategoryId && getSpecsByCategoryId(activeCategoryId).length > 0" class="section form category-form">
        <h3 class="category-form-title">{{ getCategoryName(activeCategoryId) }}</h3>
        <div v-for="spec in getSpecsByCategoryId(activeCategoryId)" :key="spec.id" class="field">
          <label class="field-label">{{ spec.keyName }}</label>
          <select
            :value="selections[activeCategoryId]?.[spec.keyName]"
            class="field-select"
            @change="onSpecChange(activeCategoryId, spec.keyName, $event.target.value)"
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
      <p v-else-if="activeCategoryId" class="empty-hint">「{{ getCategoryName(activeCategoryId) }}」暂无规格配置。</p>

      <section v-if="cartItems.length > 0" class="section summary">
        <div v-if="totalPrice !== null" class="total-row">
          <span class="total-label">当前合计</span>
          <span class="total-price">￥{{ formatPrice(totalPrice) }}</span>
        </div>
        <button v-if="hasSelection" class="btn-clear" @click="clearSelections">清空选择</button>
      </section>
    </template>
    </div>

    <!-- 购物车入口 -->
    <button
      type="button"
      class="cart-trigger"
      :class="{ 'has-items': cartItems.length > 0 }"
      @click="drawerOpen = true"
      title="购物车"
    >
      <span class="cart-icon">🛒</span>
      <span v-if="cartItems.length > 0" class="cart-badge">{{ cartItems.length }}</span>
    </button>

    <!-- 右侧抽屉：购物车 -->
    <div class="drawer-mask" :class="{ open: drawerOpen }" @click="drawerOpen = false" />
    <aside class="drawer" :class="{ open: drawerOpen }">
      <div class="drawer-header">
        <h2>购物车</h2>
        <button type="button" class="drawer-close" @click="drawerOpen = false">×</button>
      </div>
      <div class="drawer-body">
        <template v-if="cartItems.length === 0">
          <p class="cart-empty">暂无已选商品</p>
        </template>
        <template v-else>
          <div class="cart-grid">
            <div v-for="(block, idx) in cartItems" :key="block.catId + '-' + idx" class="cart-card">
              <div class="cart-card-head">
                <img v-if="block.categoryImage" :src="block.categoryImage" class="cart-card-img" alt="" />
                <span v-else class="cart-card-noimg">图</span>
                <span class="cart-card-name">{{ block.categoryName }}</span>
                <button type="button" class="cart-card-remove" title="删除" @click="removeCartItem(block.catId)">×</button>
              </div>
              <ul class="cart-card-specs">
                <li v-for="item in block.items" :key="item.keyName">
                  {{ item.keyName }}：{{ item.chosenLabel }}
                  <span class="cart-item-price">￥{{ formatPrice(item.price) }}</span>
                </li>
              </ul>
              <div class="cart-card-subtotal">小计 ￥{{ formatPrice(block.subtotal) }}</div>
            </div>
          </div>
          <div class="cart-total-row">
            <span class="cart-total-label">累计总价</span>
            <span class="cart-total-price">￥{{ formatPrice(totalPrice || 0) }}</span>
          </div>
        </template>
      </div>
    </aside>
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
      activeCategoryId: null,
      selections: loadSelections(),
      drawerOpen: false
    };
  },
  computed: {
    cartItems() {
      const list = [];
      const catIdsWithSelection = new Set();
      Object.keys(this.selections).forEach(catId => {
        const sel = this.selections[catId];
        if (sel && Object.values(sel).some(Boolean)) catIdsWithSelection.add(catId);
      });
      for (const catId of catIdsWithSelection) {
        const sel = this.selections[catId] || {};
        const specs = this.getSpecsByCategoryId(catId);
        const items = [];
        let subtotal = 0;
        for (const spec of specs) {
          const chosen = sel[spec.keyName];
          if (!chosen) continue;
          const opt = (spec.values || []).find(v => v.label === chosen);
          if (opt) {
            const price = Number(opt.price) || 0;
            items.push({ keyName: spec.keyName, chosenLabel: chosen, price });
            subtotal += price;
          }
        }
        if (items.length > 0) {
          const cat = this.categories.find(c => c.id === catId);
          list.push({
            catId,
            categoryName: cat ? cat.name : '',
            categoryImage: cat ? cat.image : '',
            items,
            subtotal
          });
        }
      }
      return list;
    },
    hasSelection() {
      return Object.keys(this.selections).some(catId => {
        const sel = this.selections[catId];
        return sel && Object.values(sel).some(Boolean);
      });
    },
    totalPrice() {
      let total = 0;
      for (const catId of Object.keys(this.selections || {})) {
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
    selectCategory(id) {
      this.activeCategoryId = id;
    },
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
      this.selections = {};
      this.saveSelections();
    },
    removeCartItem(catId) {
      this.selections[catId] = {};
      this.saveSelections();
    }
  },
  mounted() {
    const { categories, specsByCategory } = loadConfig();
    this.categories = categories || [];
    this.specsByCategory = specsByCategory || {};
    this.selections = loadSelections();
  },
  activated() {
    const { categories, specsByCategory } = loadConfig();
    this.categories = categories || [];
    this.specsByCategory = specsByCategory || {};
    this.selections = loadSelections();
  }
};
</script>

<style scoped>
.sales-page {
  position: relative;
  padding: 1rem;
  max-width: 720px;
  margin: 0 auto;
  text-align: left;
}
.main-wrap {
  padding-right: 3rem;
}
.cart-trigger {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: border-color 0.2s, background 0.2s;
}
.cart-trigger:hover {
  border-color: #2196f3;
  background: #e3f2fd;
}
.cart-trigger.has-items {
  border-color: #2196f3;
  background: #bbdefb;
}
.cart-icon {
  line-height: 1;
}
.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #f44336;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
}
.drawer-mask.open {
  opacity: 1;
  visibility: visible;
}
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 90vw;
  height: 100vh;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  z-index: 201;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.25s ease;
}
.drawer.open {
  transform: translateX(0);
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.drawer-header h2 {
  margin: 0;
  font-size: 1.15rem;
}
.drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
}
.drawer-close:hover {
  background: #f0f0f0;
  color: #333;
}
.drawer-body {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}
.cart-empty {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
.cart-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.cart-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem;
  background: #fafafa;
}
.cart-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
}
.cart-card-remove {
  margin-left: auto;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: #ffebee;
  color: #c62828;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.cart-card-remove:hover {
  background: #f44336;
  color: #fff;
}
.cart-card-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}
.cart-card-noimg {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #999;
}
.cart-card-name {
  font-weight: 600;
  font-size: 0.95rem;
}
.cart-card-specs {
  list-style: none;
  margin: 0 0 0.5rem 0;
  padding: 0;
  font-size: 0.9rem;
  color: #555;
}
.cart-card-specs li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0;
}
.cart-item-price {
  color: #2e7d32;
  font-weight: 500;
}
.cart-card-subtotal {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1565c0;
  padding-top: 0.35rem;
  border-top: 1px dashed #ddd;
}
.cart-total-row {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #e8f5e9;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cart-total-label {
  font-weight: 600;
  font-size: 1rem;
}
.cart-total-price {
  font-size: 1.25rem;
  color: #2e7d32;
  font-weight: 700;
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
