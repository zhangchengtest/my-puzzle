<template>
  <div class="furniture-manage">
    <h1>家具管理</h1>
    <p class="tip">先添加一级菜单（如桌子、椅子、沙发），选中后再为该分类配置规格 key-value。</p>

    <!-- 一级菜单 -->
    <section class="section">
      <h2>一级菜单</h2>
      <div class="add-key-row">
        <input v-model="newCategory" type="text" placeholder="输入分类名（如：桌子、椅子、沙发）" class="key-input" />
        <button class="btn-add" @click="addCategory">添加分类</button>
      </div>
      <div class="category-tabs">
        <span
          v-for="(cat, index) in categories"
          :key="cat.id"
          :class="['tab-wrap', { active: selectedCategoryId === cat.id }]"
        >
          <img v-if="cat.image" :src="cat.image" class="cat-thumb" alt="" />
          <button type="button" class="tab" @click="selectedCategoryId = cat.id">{{ cat.name }}</button>
          <button type="button" class="tab-del" @click.stop="removeCategory(index)" title="删除分类">×</button>
        </span>
      </div>
      <!-- 当前分类图片 -->
      <div v-if="selectedCategoryId && currentCategory" class="category-image-edit">
        <label class="image-label">分类图片</label>
        <div v-if="currentCategory.image" class="image-preview-wrap">
          <img :src="currentCategory.image" class="cat-preview" alt="分类图" />
          <button type="button" class="btn-del small" @click="clearCategoryImage">删除图片</button>
        </div>
        <div class="image-input-row">
          <input v-model="categoryImageUrl" type="text" placeholder="输入图片链接" class="key-input" />
          <button type="button" class="btn-add small" @click="setCategoryImageUrl">设置链接</button>
        </div>
        <div class="image-input-row">
          <input ref="categoryImageFileRef" type="file" accept="image/*" class="file-input" @change="onCategoryImageFile" />
          <span class="file-hint">或选择本地图片上传</span>
        </div>
      </div>
      <p v-if="categories.length === 0" class="empty-hint">请先添加一级菜单。</p>
    </section>

    <!-- 当前分类下的规格 key-value -->
    <section v-if="selectedCategoryId" class="section">
      <h2>规格（key-value）— {{ currentCategoryName }}</h2>
      <div class="add-key-row">
        <input v-model="newKey" type="text" placeholder="输入规格名 key（如：颜色、尺寸）" class="key-input" />
        <button class="btn-add" @click="addKey">添加 Key</button>
      </div>
      <div class="list">
        <div v-for="(item, index) in currentSpecs" :key="item.id" class="item-card">
          <div class="item-header">
            <span class="item-key">{{ item.keyName }}</span>
            <button class="btn-del small" @click="removeKey(index)" title="删除此项">删除</button>
          </div>
          <div class="values-row">
            <input
              v-model="newValueInput[item.id]"
              type="text"
              placeholder="选项名称"
              class="value-input short"
              @keydown.enter.prevent="addValue(index)"
            />
            <input
              v-model.number="newPriceInput[item.id]"
              type="number"
              placeholder="价格"
              min="0"
              step="0.01"
              class="value-input num"
              @keydown.enter.prevent="addValue(index)"
            />
            <button class="btn-add small" @click="addValue(index)">添加 Value</button>
          </div>
          <div class="value-tags">
            <span v-for="(v, vi) in item.values" :key="vi" class="tag">
              {{ v.label }} <span class="tag-price">￥{{ formatPrice(v.price) }}</span>
              <button type="button" class="tag-remove" @click="removeValue(index, vi)">×</button>
            </span>
            <span v-if="item.values.length === 0" class="empty-hint">暂无选项</span>
          </div>
        </div>
        <p v-if="currentSpecs.length === 0" class="empty-hint">该分类下暂无规格，可添加 Key。</p>
      </div>
    </section>
  </div>
</template>

<script>
const STORAGE_KEY = 'furniture_config';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { categories: [], specsByCategory: {} };
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return { categories: [], specsByCategory: {} };
    }
    return {
      categories: Array.isArray(data.categories) ? data.categories : [],
      specsByCategory: data.specsByCategory && typeof data.specsByCategory === 'object' ? data.specsByCategory : {}
    };
  } catch {
    return { categories: [], specsByCategory: {} };
  }
}

function saveToStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeValues(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(v => {
    if (v && typeof v === 'object' && 'label' in v) {
      return { label: String(v.label), price: Number(v.price) || 0 };
    }
    return { label: String(v), price: 0 };
  });
}

export default {
  name: 'FurnitureManage',
  data() {
    const { categories, specsByCategory } = loadFromStorage();
    const cats = (categories || []).map((c, i) => ({
      id: c.id || 'cat_' + Date.now() + '_' + i,
      name: c.name || '',
      image: c.image || ''
    }));
    const specs = {};
    for (const [cid, list] of Object.entries(specsByCategory || {})) {
      specs[cid] = (list || []).map((s, i) => ({
        id: s.id || 'spec_' + Date.now() + '_' + i,
        keyName: s.keyName || '',
        values: normalizeValues(s.values)
      }));
    }
    return {
      categories: cats,
      specsByCategory: specs,
      selectedCategoryId: cats[0]?.id || null,
      newCategory: '',
      newKey: '',
      newValueInput: {},
      newPriceInput: {},
      categoryImageUrl: ''
    };
  },
  computed: {
    currentCategory() {
      if (!this.selectedCategoryId) return null;
      return this.categories.find(c => c.id === this.selectedCategoryId) || null;
    },
    currentSpecs() {
      if (!this.selectedCategoryId) return [];
      return this.specsByCategory[this.selectedCategoryId] || [];
    },
    currentCategoryName() {
      const cat = this.categories.find(c => c.id === this.selectedCategoryId);
      return cat ? cat.name : '';
    }
  },
  methods: {
    addCategory() {
      const name = (this.newCategory || '').trim();
      if (!name) return;
      if (this.categories.some(c => c.name === name)) {
        alert('该分类已存在');
        return;
      }
      const id = 'cat_' + Date.now();
      this.categories.push({ id, name, image: '' });
      if (!this.specsByCategory[id]) this.specsByCategory[id] = [];
      this.newCategory = '';
      this.selectedCategoryId = id;
      this.save();
    },
    setCategoryImageUrl() {
      const url = (this.categoryImageUrl || '').trim();
      if (!url || !this.currentCategory) return;
      this.currentCategory.image = url;
      this.categoryImageUrl = '';
      this.save();
    },
    clearCategoryImage() {
      if (!this.currentCategory) return;
      this.currentCategory.image = '';
      this.save();
    },
    onCategoryImageFile(e) {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/') || !this.currentCategory) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.currentCategory.image = reader.result;
        this.save();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    removeCategory(index) {
      const cat = this.categories[index];
      this.categories.splice(index, 1);
      delete this.specsByCategory[cat.id];
      if (this.selectedCategoryId === cat.id) {
        this.selectedCategoryId = this.categories[0]?.id || null;
      }
      this.save();
    },
    addKey() {
      if (!this.selectedCategoryId) return;
      const keyName = (this.newKey || '').trim();
      if (!keyName) return;
      const list = this.specsByCategory[this.selectedCategoryId] || [];
      if (list.some(it => it.keyName === keyName)) {
        alert('该 key 已存在');
        return;
      }
      const id = 'spec_' + Date.now();
      list.push({ id, keyName, values: [] });
      this.specsByCategory[this.selectedCategoryId] = list;
      this.newValueInput[id] = '';
      this.newPriceInput[id] = '';
      this.newKey = '';
      this.save();
    },
    removeKey(index) {
      const list = this.specsByCategory[this.selectedCategoryId];
      if (!list) return;
      list.splice(index, 1);
      this.save();
    },
    addValue(index) {
      const list = this.specsByCategory[this.selectedCategoryId];
      if (!list) return;
      const item = list[index];
      const label = (this.newValueInput[item.id] || '').trim();
      if (!label) return;
      const price = Number(this.newPriceInput[item.id]) || 0;
      if (item.values.some(v => v.label === label)) return;
      item.values.push({ label, price });
      this.newValueInput[item.id] = '';
      this.newPriceInput[item.id] = '';
      this.save();
    },
    formatPrice(p) {
      const n = Number(p);
      return isNaN(n) ? '0' : n.toFixed(2);
    },
    removeValue(keyIndex, valueIndex) {
      const list = this.specsByCategory[this.selectedCategoryId];
      if (!list) return;
      list[keyIndex].values.splice(valueIndex, 1);
      this.save();
    },
    save() {
      const state = {
        categories: this.categories.map(c => ({ id: c.id, name: c.name, image: c.image || '' })),
        specsByCategory: {}
      };
      for (const [cid, list] of Object.entries(this.specsByCategory)) {
        state.specsByCategory[cid] = list.map(({ id, keyName, values }) => ({
          id,
          keyName,
          values: values.map(v => ({ label: v.label, price: Number(v.price) || 0 }))
        }));
      }
      saveToStorage(state);
    }
  }
};
</script>

<style scoped>
.furniture-manage {
  padding: 1rem;
  max-width: 640px;
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
  margin-bottom: 1rem;
}
.section {
  margin-bottom: 1.5rem;
}
.section h2 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}
.add-key-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}
.key-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
.btn-add {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
.btn-add:hover {
  background: #43a047;
}
.btn-add.small {
  padding: 0.35rem 0.75rem;
  font-size: 0.9rem;
}
.btn-del {
  padding: 0.35rem 0.75rem;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-del:hover {
  background: #d32f2f;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.tab-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.2rem 0.2rem 0.2rem 0.5rem;
  background: #e0e0e0;
  border-radius: 6px;
}
.tab-wrap.active {
  background: #2196f3;
  color: #fff;
}
.tab {
  padding: 0.3rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.tab-wrap.active .tab {
  color: #fff;
}
.tab-del {
  padding: 0.1rem 0.35rem;
  background: rgba(0,0,0,0.1);
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}
.tab-wrap.active .tab-del {
  color: #fff;
}
.tab-del:hover {
  background: rgba(244,67,54,0.3);
  color: #f44336;
}
.tab-wrap.active .tab-del:hover {
  color: #ffcdd2;
}
.cat-thumb {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}
.category-image-edit {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;
}
.image-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.image-preview-wrap {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cat-preview {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.image-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.image-input-row:last-of-type {
  margin-bottom: 0;
}
.file-input {
  font-size: 0.85rem;
}
.file-hint {
  color: #666;
  font-size: 0.85rem;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.item-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.item-key {
  font-weight: 600;
  font-size: 1.05rem;
}
.values-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}
.value-input {
  padding: 0.4rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.value-input.short {
  min-width: 100px;
  flex: 1;
}
.value-input.num {
  width: 90px;
}
.tag-price {
  color: #2e7d32;
  font-size: 0.85em;
  margin-left: 0.25rem;
}
.value-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 0.9rem;
}
.tag-remove {
  padding: 0 0.2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1.1rem;
  line-height: 1;
}
.tag-remove:hover {
  color: #d32f2f;
}
.empty-hint {
  color: #999;
  font-size: 0.9rem;
}
</style>
