<template>
  <div class="surge-page">
    <h1 class="page-title">暴涨资产档案</h1>
    <p class="subtitle">折线对照这些年真正暴涨过的东西。默认按起点=1 归一化，对数轴看倍数。</p>

    <section class="toolbar">
      <div class="mode-row">
        <button
          :class="['chip', { active: scaleMode === 'norm' }]"
          @click="scaleMode = 'norm'"
        >归一化倍数</button>
        <button
          :class="['chip', { active: scaleMode === 'abs' }]"
          @click="scaleMode = 'abs'"
          :disabled="selectedIds.length !== 1"
          title="仅单选一条时可看绝对价格"
        >绝对价格</button>
        <button
          :class="['chip', { active: useLog }]"
          @click="useLog = !useLog"
        >{{ useLog ? '对数轴' : '线性轴' }}</button>
      </div>
      <input
        v-model="searchText"
        class="search-input"
        placeholder="搜索名称、标签、启示..."
      />
      <div class="genre-row">
        <button
          v-for="c in categories"
          :key="c"
          :class="['chip', { active: category === c }]"
          @click="category = c"
        >{{ c }}</button>
      </div>
      <div class="genre-row select-row">
        <button class="chip ghost" @click="selectAllVisible">全选当前</button>
        <button class="chip ghost" @click="clearSelection">清空选中</button>
        <span class="hint inline">已选 {{ selectedIds.length }} / {{ filteredList.length }}</span>
      </div>
    </section>

    <section class="chart-section">
      <div ref="chartEl" class="chart-wrap"></div>
      <p class="hint chart-hint">
        {{ scaleMode === 'norm' ? '纵轴：相对起点的倍数（起点=1）' : '纵轴：绝对价格（约数）' }}
        · 价格为示意约数，非实时行情
      </p>
      <div class="legend">
        <button
          v-for="item in chartableList"
          :key="item.id"
          :class="['legend-item', { on: selectedIds.includes(item.id) }]"
          :style="legendStyle(item)"
          @click="toggleSelect(item.id)"
        >
          <span class="swatch" :style="{ background: colorOf(item.id) }" />
          {{ item.name }}
          <em>{{ item.multiple }}</em>
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2 class="section-title">详情与笔记</h2>
        <button class="btn ghost" @click="showForm = !showForm">
          {{ showForm ? '收起' : '+ 追加一条' }}
        </button>
      </div>

      <div v-if="showForm" class="form-box">
        <div class="form-grid">
          <input v-model="draft.name" class="text-input" placeholder="资产名称 *" />
          <select v-model="draft.category" class="text-input">
            <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
          </select>
          <input v-model.number="draft.startYear" type="number" class="text-input" placeholder="起点年份 *" />
          <input v-model.number="draft.endYear" type="number" class="text-input" placeholder="高点年份 *" />
          <input v-model.number="draft.fromValue" type="number" step="any" class="text-input" placeholder="起点价（数字）*" />
          <input v-model.number="draft.toValue" type="number" step="any" class="text-input" placeholder="高点价（数字）*" />
          <input v-model="draft.unit" class="text-input" placeholder="单位，如 USD / CNY" />
          <input v-model="draft.tagsText" class="text-input" placeholder="标签，逗号分隔" />
        </div>
        <textarea
          v-model="draft.lesson"
          class="outline-input"
          rows="2"
          placeholder="一句话启示 / 为什么暴涨 / 后来怎样"
        />
        <div class="draft-actions">
          <button class="btn" :disabled="!canSaveDraft" @click="addAsset">保存并画线</button>
          <button class="btn ghost" @click="resetDraft">清空</button>
        </div>
      </div>

      <p v-if="!filteredList.length" class="hint empty">没有匹配的记录</p>

      <article
        v-for="item in filteredList"
        :key="item.id"
        class="asset-card"
        :class="{ active: selectedIds.includes(item.id), custom: item.custom }"
        @click="toggleSelect(item.id)"
      >
        <header class="asset-head">
          <div>
            <h3 class="asset-name">
              <span class="swatch sm" :style="{ background: colorOf(item.id) }" />
              {{ item.name }}
              <span v-if="item.custom" class="badge">自建</span>
            </h3>
            <p class="asset-meta">
              <span class="cat">{{ item.category }}</span>
              <span>{{ item.period }}</span>
            </p>
          </div>
          <div class="multiple">{{ item.multiple || '—' }}</div>
        </header>

        <p v-if="item.lesson" class="lesson">{{ item.lesson }}</p>

        <div class="note-box" @click.stop>
          <label class="field-label tight">我的笔记</label>
          <textarea
            :value="notes[item.id] || ''"
            class="outline-input note-input"
            rows="2"
            placeholder="写下你当时的观察、错过的原因、下次想盯的信号…"
            @input="onNoteInput(item.id, $event.target.value)"
          />
        </div>

        <div v-if="item.custom" class="card-actions" @click.stop>
          <button class="btn danger ghost" @click="removeAsset(item.id)">删除这条</button>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { defaultAssets, categories, CHART_COLORS } from '@/data/surgeAssets';

const STORAGE_CUSTOM = 'surgeAssetsCustom';
const STORAGE_NOTES = 'surgeAssetsNotes';
const STORAGE_SELECTED = 'surgeAssetsSelected';

export default {
  name: 'SurgeAssets',
  data() {
    return {
      categories,
      category: '全部',
      searchText: '',
      showForm: false,
      scaleMode: 'norm',
      useLog: true,
      selectedIds: [],
      customAssets: [],
      notes: {},
      noteTimers: {},
      draft: this.emptyDraft(),
      resizeObserver: null
    };
  },
  computed: {
    categoryOptions() {
      return this.categories.filter(c => c !== '全部');
    },
    allAssets() {
      return [...defaultAssets, ...this.customAssets];
    },
    filteredList() {
      let list = this.allAssets;
      if (this.category !== '全部') {
        list = list.filter(a => a.category === this.category);
      }
      if (this.searchText.trim()) {
        const kw = this.searchText.trim().toLowerCase();
        list = list.filter(a => {
          const note = (this.notes[a.id] || '').toLowerCase();
          const tags = (a.tags || []).join(' ').toLowerCase();
          return (
            a.name.toLowerCase().includes(kw) ||
            (a.lesson || '').toLowerCase().includes(kw) ||
            (a.period || '').toLowerCase().includes(kw) ||
            tags.includes(kw) ||
            note.includes(kw)
          );
        });
      }
      return [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
    },
    chartableList() {
      return this.filteredList.filter(a => a.series && a.series.length >= 2);
    },
    selectedAssets() {
      const set = new Set(this.selectedIds);
      return this.chartableList.filter(a => set.has(a.id));
    },
    canSaveDraft() {
      const d = this.draft;
      return (
        d.name.trim() &&
        Number.isFinite(d.startYear) &&
        Number.isFinite(d.endYear) &&
        Number.isFinite(d.fromValue) &&
        Number.isFinite(d.toValue) &&
        d.fromValue > 0 &&
        d.toValue > 0 &&
        d.endYear > d.startYear
      );
    }
  },
  watch: {
    selectedAssets: { deep: true, handler() { this.drawChart(); } },
    scaleMode() { this.drawChart(); },
    useLog() { this.drawChart(); },
    filteredList() {
      this.pruneSelection();
      this.$nextTick(() => this.drawChart());
    },
    selectedIds: {
      deep: true,
      handler(ids) {
        localStorage.setItem(STORAGE_SELECTED, JSON.stringify(ids));
        if (ids.length !== 1 && this.scaleMode === 'abs') {
          this.scaleMode = 'norm';
        }
      }
    }
  },
  mounted() {
    this.load();
    this.$nextTick(() => {
      this.drawChart();
      if (typeof ResizeObserver !== 'undefined' && this.$refs.chartEl) {
        this.resizeObserver = new ResizeObserver(() => this.drawChart());
        this.resizeObserver.observe(this.$refs.chartEl);
      }
    });
  },
  beforeUnmount() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  },
  methods: {
    emptyDraft() {
      return {
        name: '',
        category: '股票',
        startYear: undefined,
        endYear: undefined,
        fromValue: undefined,
        toValue: undefined,
        unit: '',
        tagsText: '',
        lesson: ''
      };
    },
    colorOf(id) {
      const idx = this.allAssets.findIndex(a => a.id === id);
      return CHART_COLORS[(idx >= 0 ? idx : 0) % CHART_COLORS.length];
    },
    legendStyle(item) {
      const on = this.selectedIds.includes(item.id);
      return on ? { borderColor: this.colorOf(item.id) } : {};
    },
    load() {
      try {
        this.customAssets = JSON.parse(localStorage.getItem(STORAGE_CUSTOM) || '[]');
      } catch {
        this.customAssets = [];
      }
      try {
        this.notes = JSON.parse(localStorage.getItem(STORAGE_NOTES) || '{}');
      } catch {
        this.notes = {};
      }
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_SELECTED) || '[]');
        const valid = new Set(this.allAssets.map(a => a.id));
        this.selectedIds = saved.filter(id => valid.has(id));
      } catch {
        this.selectedIds = [];
      }
      if (!this.selectedIds.length) {
        this.selectedIds = defaultAssets.slice(0, 5).map(a => a.id);
      }
    },
    saveCustom() {
      localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(this.customAssets));
    },
    saveNotes() {
      localStorage.setItem(STORAGE_NOTES, JSON.stringify(this.notes));
    },
    onNoteInput(id, value) {
      this.notes = { ...this.notes, [id]: value };
      clearTimeout(this.noteTimers[id]);
      this.noteTimers[id] = setTimeout(() => this.saveNotes(), 300);
    },
    toggleSelect(id) {
      const i = this.selectedIds.indexOf(id);
      if (i >= 0) {
        this.selectedIds = this.selectedIds.filter(x => x !== id);
      } else {
        this.selectedIds = [...this.selectedIds, id];
      }
    },
    selectAllVisible() {
      this.selectedIds = this.chartableList.map(a => a.id);
    },
    clearSelection() {
      this.selectedIds = [];
    },
    pruneSelection() {
      const valid = new Set(this.chartableList.map(a => a.id));
      this.selectedIds = this.selectedIds.filter(id => valid.has(id));
    },
    resetDraft() {
      this.draft = this.emptyDraft();
    },
    buildSeries(startYear, endYear, fromValue, toValue) {
      const points = [];
      const steps = Math.max(2, Math.min(8, Math.round(endYear - startYear) + 1));
      for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const t = startYear + (endYear - startYear) * ratio;
        // 指数插值，更贴近暴涨形态
        const v = fromValue * Math.pow(toValue / fromValue, ratio);
        points.push({ t: Math.round(t * 100) / 100, v: Math.round(v * 1e6) / 1e6 });
      }
      return points;
    },
    addAsset() {
      if (!this.canSaveDraft) return;
      const d = this.draft;
      const tags = d.tagsText
        .split(/[,，]/)
        .map(t => t.trim())
        .filter(Boolean);
      const series = this.buildSeries(d.startYear, d.endYear, d.fromValue, d.toValue);
      const multiple = `约 ${(d.toValue / d.fromValue).toFixed(1)}×`;
      const id = `custom-${Date.now()}`;
      this.customAssets.unshift({
        id,
        name: d.name.trim(),
        category: d.category || '其他',
        period: `${d.startYear} – ${d.endYear}`,
        unit: d.unit.trim() || '',
        from: String(d.fromValue),
        to: String(d.toValue),
        multiple,
        year: d.endYear,
        lesson: d.lesson.trim(),
        tags,
        series,
        custom: true
      });
      this.saveCustom();
      this.selectedIds = [...this.selectedIds, id];
      this.resetDraft();
      this.showForm = false;
      this.category = '全部';
    },
    removeAsset(id) {
      if (!confirm('确定删除这条自定义记录？')) return;
      this.customAssets = this.customAssets.filter(a => a.id !== id);
      this.selectedIds = this.selectedIds.filter(x => x !== id);
      const next = { ...this.notes };
      delete next[id];
      this.notes = next;
      this.saveCustom();
      this.saveNotes();
    },
    formatYear(t) {
      if (Number.isInteger(t)) return String(t);
      const y = Math.floor(t);
      const m = Math.round((t - y) * 12) + 1;
      return m <= 1 ? String(y) : `${y}.${String(m).padStart(2, '0')}`;
    },
    formatValue(v) {
      if (v >= 1000) return d3.format(',.0f')(v);
      if (v >= 1) return d3.format(',.2f')(v);
      if (v >= 0.01) return d3.format('.3f')(v);
      return d3.format('.2e')(v);
    },
    drawChart() {
      const el = this.$refs.chartEl;
      if (!el) return;

      const assets = this.selectedAssets;
      const width = el.clientWidth || 700;
      const height = Math.max(280, Math.min(420, width * 0.55));
      const margin = { top: 16, right: 16, bottom: 36, left: 52 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      d3.select(el).selectAll('*').remove();

      const svg = d3
        .select(el)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

      if (!assets.length) {
        svg
          .append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#999')
          .attr('font-size', 14)
          .text('点选下方图例或卡片，叠加到折线图');
        return;
      }

      const seriesData = assets.map(a => {
        const base = a.series[0].v;
        const points = a.series.map(p => ({
          t: p.t,
          raw: p.v,
          v: this.scaleMode === 'norm' ? p.v / base : p.v
        }));
        return { asset: a, points, color: this.colorOf(a.id) };
      });

      const allPoints = seriesData.flatMap(s => s.points);
      const xExtent = d3.extent(allPoints, d => d.t);
      let yMin = d3.min(allPoints, d => d.v);
      let yMax = d3.max(allPoints, d => d.v);
      if (yMin === yMax) {
        yMin *= 0.9;
        yMax *= 1.1;
      }
      if (this.useLog) {
        yMin = Math.max(yMin, 1e-12);
      }

      const x = d3.scaleLinear().domain(xExtent).range([0, innerW]).nice();
      const y = (this.useLog ? d3.scaleLog() : d3.scaleLinear())
        .domain(this.useLog ? [yMin, yMax] : [Math.min(0, yMin), yMax])
        .range([innerH, 0])
        .nice();

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(y)
            .ticks(6)
            .tickSize(-innerW)
            .tickFormat('')
        )
        .call(sel => sel.select('.domain').remove())
        .selectAll('line')
        .attr('stroke', '#eee');

      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(Math.min(8, Math.ceil(xExtent[1] - xExtent[0]) || 4))
            .tickFormat(d => this.formatYear(d))
        )
        .call(sel => {
          sel.select('.domain').attr('stroke', '#ccc');
          sel.selectAll('text').attr('fill', '#666').attr('font-size', 11);
          sel.selectAll('line').attr('stroke', '#ccc');
        });

      const yAxis = d3.axisLeft(y).ticks(6);
      if (this.scaleMode === 'norm') {
        yAxis.tickFormat(d => {
          if (d >= 1000) return `${d3.format('.2s')(d)}×`;
          if (d >= 10) return `${d3.format('.0f')(d)}×`;
          if (d >= 1) return `${d3.format('.1f')(d)}×`;
          return `${d3.format('.2f')(d)}×`;
        });
      } else {
        yAxis.tickFormat(d => this.formatValue(d));
      }

      g.append('g')
        .call(yAxis)
        .call(sel => {
          sel.select('.domain').attr('stroke', '#ccc');
          sel.selectAll('text').attr('fill', '#666').attr('font-size', 11);
          sel.selectAll('line').attr('stroke', '#ccc');
        });

      const line = d3
        .line()
        .x(d => x(d.t))
        .y(d => y(d.v))
        .curve(d3.curveMonotoneX);

      const tooltip = d3
        .select(el)
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('opacity', 0);

      seriesData.forEach(({ asset, points, color }) => {
        g.append('path')
          .datum(points)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2.2)
          .attr('d', line);

        g.selectAll(null)
          .data(points)
          .join('circle')
          .attr('cx', d => x(d.t))
          .attr('cy', d => y(d.v))
          .attr('r', 3.2)
          .attr('fill', color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseenter', (event, d) => {
            const label =
              this.scaleMode === 'norm'
                ? `${this.formatValue(d.v)}×（原价 ${this.formatValue(d.raw)}）`
                : this.formatValue(d.raw);
            tooltip
              .style('opacity', 1)
              .html(
                `<strong>${asset.name}</strong><br/>${this.formatYear(d.t)} · ${label}`
              )
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 10}px`);
          })
          .on('mouseleave', () => tooltip.style('opacity', 0));
      });
    }
  }
};
</script>

<style scoped>
.surge-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
  color: #222;
}

.page-title {
  margin: 0 0 6px;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0 0 20px;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.toolbar {
  margin-bottom: 16px;
}

.mode-row,
.genre-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.select-row {
  align-items: center;
}

.search-input,
.text-input,
.outline-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  background: #fff;
  color: #222;
}

.search-input {
  margin-bottom: 10px;
}

.chip {
  padding: 7px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.9rem;
  color: #222;
}

.chip:hover {
  background: #e8e8e8;
}

.chip.active {
  background: #0066ff;
  color: #fff;
  border-color: #0066ff;
}

.chip.ghost {
  background: #fff;
}

.chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hint {
  margin: 8px 0 0;
  color: #777;
  font-size: 0.9rem;
}

.hint.inline {
  margin: 0;
}

.hint.empty {
  margin: 16px 0;
}

.chart-section {
  margin-bottom: 28px;
}

.chart-wrap {
  position: relative;
  width: 100%;
  min-height: 280px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.chart-wrap :deep(.chart-tooltip) {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  padding: 8px 10px;
  background: rgba(30, 30, 30, 0.92);
  color: #fff;
  font-size: 12px;
  line-height: 1.45;
  border-radius: 6px;
  max-width: 220px;
}

.chart-hint {
  margin-top: 8px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: #444;
  opacity: 0.45;
}

.legend-item.on {
  opacity: 1;
  background: #fff;
  font-weight: 600;
}

.legend-item em {
  font-style: normal;
  color: #c0392b;
  font-size: 0.8rem;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.swatch.sm {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  vertical-align: middle;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.form-box {
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.outline-input {
  resize: vertical;
  margin-bottom: 8px;
}

.draft-actions,
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #0066ff;
  border-radius: 6px;
  background: #0066ff;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn.ghost {
  background: #fff;
  color: #0066ff;
}

.btn.danger {
  border-color: #c0392b;
  color: #c0392b;
}

.asset-card {
  padding: 14px 0;
  border-top: 1px solid #e8e8e8;
  cursor: pointer;
}

.asset-card.active {
  background: linear-gradient(90deg, rgba(0, 102, 255, 0.04), transparent);
}

.asset-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.asset-name {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 700;
}

.badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0066ff;
  border: 1px solid #99c2ff;
  border-radius: 4px;
  vertical-align: middle;
}

.asset-meta {
  margin: 0;
  color: #777;
  font-size: 0.85rem;
}

.asset-meta .cat {
  margin-right: 8px;
  color: #0066ff;
}

.multiple {
  flex-shrink: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #c0392b;
  white-space: nowrap;
}

.lesson {
  margin: 10px 0;
  color: #444;
  font-size: 0.92rem;
  line-height: 1.6;
}

.note-box {
  margin-top: 4px;
}

.field-label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #555;
}

.field-label.tight {
  margin-top: 0;
}

.note-input {
  background: #f7f8fa;
  margin-bottom: 0;
}
</style>
