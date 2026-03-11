<template>
  <div class="group-page">
    <h1>分组管理</h1>
    <p class="tip">这里管理“产品”上层的分组。家具管理/销售页会先选分组，再显示该分组下的产品。</p>

    <div class="add-row">
      <input v-model="newGroup" type="text" placeholder="输入分组名称（如：客厅/卧室/餐厅）" class="input" />
      <button class="btn-add" @click="addGroup">添加分组</button>
    </div>

    <div v-if="groups.length === 0" class="empty">暂无分组，请先添加。</div>

    <div v-else class="list">
      <div v-for="(g, idx) in groups" :key="g.id" class="card">
        <div class="card-head">
          <span class="name">{{ g.name }}</span>
          <button type="button" class="btn-del" @click="removeGroup(idx)">删除</button>
        </div>
        <div class="meta">id：{{ g.id }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const STORAGE_KEY = 'furniture_config';

function ensureConfig(raw) {
  if (!raw) return { groups: [], categories: [], specsByCategory: {} };
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { groups: [], categories: [], specsByCategory: {} };
    }
    return {
      groups: Array.isArray(data.groups) ? data.groups : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      specsByCategory: data.specsByCategory && typeof data.specsByCategory === 'object' ? data.specsByCategory : {}
    };
  } catch {
    return { groups: [], categories: [], specsByCategory: {} };
  }
}

function saveConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export default {
  name: 'FurnitureGroupManage',
  data() {
    const cfg = ensureConfig(localStorage.getItem(STORAGE_KEY));
    const groups = (cfg.groups || []).map((g, i) => ({
      id: g.id || 'grp_' + Date.now() + '_' + i,
      name: g.name || ''
    }));
    cfg.groups = groups;
    saveConfig(cfg);
    return { newGroup: '', groups };
  },
  methods: {
    addGroup() {
      const name = (this.newGroup || '').trim();
      if (!name) return;
      if (this.groups.some(g => g.name === name)) {
        alert('该分组已存在');
        return;
      }
      const id = 'grp_' + Date.now();
      this.groups.push({ id, name });
      this.newGroup = '';
      this.persist();
    },
    removeGroup(idx) {
      const g = this.groups[idx];
      if (!g) return;
      const cfg = ensureConfig(localStorage.getItem(STORAGE_KEY));
      const categories = (cfg.categories || []).filter(c => c && c.groupId === g.id);
      if (categories.length > 0) {
        const ok = confirm(`该分组下还有 ${categories.length} 个产品，删除分组不会删除产品，但这些产品会变为“未分组”。是否继续？`);
        if (!ok) return;
      }
      this.groups.splice(idx, 1);
      this.persist();

      const cfg2 = ensureConfig(localStorage.getItem(STORAGE_KEY));
      cfg2.categories = (cfg2.categories || []).map(c => (c && c.groupId === g.id ? { ...c, groupId: '' } : c));
      cfg2.groups = this.groups;
      saveConfig(cfg2);
    },
    persist() {
      const cfg = ensureConfig(localStorage.getItem(STORAGE_KEY));
      cfg.groups = this.groups.map(g => ({ id: g.id, name: g.name }));
      saveConfig(cfg);
    }
  }
};
</script>

<style scoped>
.group-page {
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
.add-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
}
.input {
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
.empty {
  color: #999;
  padding: 2rem 0;
  text-align: center;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background: #fafafa;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.name {
  font-weight: 600;
}
.meta {
  margin-top: 0.35rem;
  color: #999;
  font-size: 0.85rem;
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
</style>

