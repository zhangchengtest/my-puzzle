<template>
  <div class="qimen-dunjia">
    <div class="container">
      <h1 class="title">奇门遁甲排盘</h1>
      
      <div class="input-section">
        <div class="datetime-group">
          <label>选择时间：</label>
          <input type="datetime-local" v-model="selectedDateTime" @change="calculatePan" />
          <button @click="useCurrentTime" class="btn-current">当前时间</button>
        </div>
      </div>

      <div class="pan-section" v-if="panData">
        <div class="pan-info">
          <div class="info-item">
            <span class="label">公历：</span>
            <span>{{ panData.solarDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">农历：</span>
            <span>{{ panData.lunarDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">时辰：</span>
            <span>{{ panData.timeBranch }}</span>
          </div>
          <div class="info-item">
            <span class="label">局数：</span>
            <span>{{ panData.juNumber }}局</span>
          </div>
        </div>

        <div class="jiugong-grid">
          <div 
            v-for="(cell, index) in panData.grid" 
            :key="index"
            class="grid-cell"
            :class="getCellClass(cell)"
          >
            <div class="cell-content">
              <div class="cell-position">{{ getPositionName(index) }}</div>
              <div class="cell-tiangan">{{ cell.tiangan }}</div>
              <div class="cell-dizhi">{{ cell.dizhi }}</div>
              <div class="cell-bamen">{{ cell.bamen }}</div>
              <div class="cell-jiuxing">{{ cell.jiuxing }}</div>
              <div class="cell-bashen" v-if="cell.bashen">{{ cell.bashen }}</div>
            </div>
          </div>
        </div>

        <div class="legend">
          <h3>图例说明</h3>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-label">值符：</span>
              <span class="legend-value">值符所在宫位</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">值使：</span>
              <span class="legend-value">值使门所在宫位</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QimenDunjia',
  data() {
    return {
      selectedDateTime: '',
      panData: null
    };
  },
  mounted() {
    this.useCurrentTime();
  },
  methods: {
    useCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.selectedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      this.calculatePan();
    },
    calculatePan() {
      if (!this.selectedDateTime) return;
      
      const date = new Date(this.selectedDateTime);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      
      // 计算农历（简化版，实际应该使用农历库）
      const lunarDate = this.getLunarDate(year, month, day);
      
      // 计算时辰
      const timeBranch = this.getTimeBranch(hour);
      
      // 计算局数（简化算法）
      const juNumber = this.calculateJuNumber(year, month, day, hour);
      
      // 生成九宫格数据
      const grid = this.generateGrid(juNumber, hour);
      
      this.panData = {
        solarDate: `${year}年${month}月${day}日 ${hour}时`,
        lunarDate: lunarDate,
        timeBranch: timeBranch,
        juNumber: juNumber,
        grid: grid
      };
    },
    getLunarDate(year, month, day) {
      // 农历转换算法
      const lunarInfo = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
      ];

      const lunarMonthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
      const lunarDayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

      // 计算农历年份
      let lunarYear = year;
      let lunarMonth = 1;
      let lunarDay = 1;

      // 计算从1900年1月31日到指定日期的天数
      const baseDate = new Date(1900, 0, 31);
      const targetDate = new Date(year, month - 1, day);
      let offset = Math.floor((targetDate - baseDate) / 86400000);

      // 计算农历年份
      let i = 0;
      let daysOfYear = 0;
      while (i < lunarInfo.length && offset > 0) {
        daysOfYear = this.getLunarYearDays(lunarInfo[i], 1900 + i);
        if (offset >= daysOfYear) {
          offset -= daysOfYear;
          i++;
        } else {
          break;
        }
      }
      lunarYear = 1900 + i;

      // 计算农历月份和日期
      const leapMonth = this.getLeapMonth(lunarInfo[i], lunarYear);
      let isLeap = false;
      lunarMonth = 1;
      lunarDay = 1;
      
      // 按顺序计算每个月的天数
      for (let m = 1; m <= 12; m++) {
        // 检查是否需要插入闰月
        if (leapMonth > 0 && m === leapMonth + 1 && !isLeap) {
          // 先计算闰月
          const leapDays = this.getLeapMonthDays(lunarInfo[i], lunarYear);
          if (offset < leapDays) {
            isLeap = true;
            lunarDay = offset + 1;
            break;
          }
          offset -= leapDays;
        }
        
        // 计算正常月份
        const monthDays = this.getLunarMonthDays(lunarInfo[i], lunarYear, m);
        if (offset < monthDays) {
          lunarDay = offset + 1;
          lunarMonth = m;
          break;
        }
        offset -= monthDays;
        lunarMonth = m;
      }

      // 格式化输出
      let monthName;
      const monthNameIndex = lunarMonth - 1;
      if (isLeap) {
        monthName = '闰' + lunarMonthNames[monthNameIndex] + '月';
      } else {
        monthName = lunarMonthNames[monthNameIndex] + '月';
      }
      const dayName = lunarDayNames[lunarDay - 1];

      // 计算天干地支年份
      const ganZhiYear = this.getGanZhiYear(lunarYear);

      return `${ganZhiYear}年${monthName}月${dayName}`;
    },
    getLunarYearDays(lunarInfo, year) {
      let total = 348;
      for (let i = 0x8000; i > 0x8; i >>= 1) {
        total += (lunarInfo & i) ? 1 : 0;
      }
      return total + this.getLeapMonthDays(lunarInfo, year);
    },
    getLeapMonth(lunarInfo, year) {
      return (lunarInfo & 0xf);
    },
    getLeapMonthDays(lunarInfo, year) {
      if (this.getLeapMonth(lunarInfo, year)) {
        return ((lunarInfo & 0x10000) ? 30 : 29);
      } else {
        return 0;
      }
    },
    getLunarMonthDays(lunarInfo, year, month) {
      // 月份从1开始，位运算从高位开始：0x8000对应1月，0x4000对应2月...
      if (month > 12 || month < 1) return 0;
      // 0x8000是第16位，对应农历1月；右移(month-1)位对应第month月
      return ((lunarInfo & (0x8000 >> (month - 1))) ? 30 : 29);
    },
    getGanZhiYear(year) {
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const baseYear = 1984; // 甲子年
      const offset = (year - baseYear) % 60;
      const ganIndex = offset % 10;
      const zhiIndex = offset % 12;
      return gan[ganIndex] + zhi[zhiIndex];
    },
    getTimeBranch(hour) {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const index = Math.floor((hour + 1) / 2) % 12;
      return branches[index] + '时';
    },
    calculateJuNumber(year, month, day, hour) {
      // 简化版局数计算
      // 实际奇门遁甲局数计算比较复杂，这里用简化算法
      const solarTerm = this.getSolarTerm(month, day);
      const isYangDun = solarTerm >= 0 && solarTerm <= 5; // 阳遁
      
      if (isYangDun) {
        // 阳遁：冬至后到夏至前
        return ((month * 2 + day) % 9) + 1;
      } else {
        // 阴遁：夏至后到冬至前
        return ((month * 2 + day) % 9) + 1;
      }
    },
    getSolarTerm(month, day) {
      // 简化版节气判断
      // 实际应该精确计算节气
      if (month === 12 || month <= 2) return 0; // 冬至附近
      if (month >= 6 && month <= 8) return 6; // 夏至附近
      return 3; // 其他
    },
    generateGrid(juNumber, hour) {
      // 天干
      const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      // 地支
      const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      // 八门
      const baMen = ['休', '死', '伤', '杜', '中', '开', '惊', '生', '景'];
      // 九星
      const jiuXing = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
      // 八神
      const baShen = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
      
      // 九宫格位置（洛书顺序）
      const positions = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 中宫为5
      
      const grid = [];
      
      for (let i = 0; i < 9; i++) {
        const pos = positions[i];
        const offset = (pos + juNumber - 1) % 10;
        const dizhiOffset = (hour + pos - 1) % 12;
        
        grid.push({
          position: pos,
          tiangan: tianGan[offset % 10],
          dizhi: diZhi[dizhiOffset % 12],
          bamen: baMen[i % 9],
          jiuxing: jiuXing[i % 9],
          bashen: i === 0 ? baShen[0] : null // 值符在第一个位置
        });
      }
      
      return grid;
    },
    getPositionName(index) {
      const names = ['巽', '离', '坤', '震', '中', '兑', '艮', '坎', '乾'];
      return names[index];
    },
    getCellClass(cell) {
      const classes = [];
      if (cell.bashen === '值符') {
        classes.push('zhi-fu');
      }
      if (cell.position === 5) {
        classes.push('center');
      }
      return classes.join(' ');
    }
  }
};
</script>

<style scoped>
.qimen-dunjia {
  padding: 20px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

.container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
}

.input-section {
  margin-bottom: 30px;
}

.datetime-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.datetime-group label {
  font-weight: bold;
  color: #555;
}

.datetime-group input[type="datetime-local"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-current {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-current:hover {
  background-color: #66b1ff;
}

.pan-section {
  margin-top: 30px;
}

.pan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  font-weight: bold;
  color: #666;
  margin-right: 8px;
}

.jiugong-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 900px;
  margin: 0 auto;
}

.grid-cell {
  aspect-ratio: 1;
  border: 2px solid #333;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-cell.center {
  background-color: #fff9e6;
}

.grid-cell.zhi-fu {
  border-color: #f56c6c;
  border-width: 3px;
  background-color: #fef0f0;
}

.cell-content {
  text-align: center;
  width: 100%;
}

.cell-position {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.cell-tiangan {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  margin: 3px 0;
}

.cell-dizhi {
  font-size: 16px;
  color: #67c23a;
  margin: 3px 0;
}

.cell-bamen {
  font-size: 14px;
  color: #e6a23c;
  margin: 3px 0;
}

.cell-jiuxing {
  font-size: 13px;
  color: #909399;
  margin: 3px 0;
}

.cell-bashen {
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #ddd;
}

.legend {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.legend h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-label {
  font-weight: bold;
  color: #666;
  margin-right: 8px;
}

.legend-value {
  color: #333;
}

@media (max-width: 768px) {
  .jiugong-grid {
    gap: 5px;
  }
  
  .grid-cell {
    padding: 5px;
  }
  
  .cell-position {
    font-size: 14px;
  }
  
  .cell-tiangan {
    font-size: 16px;
  }
  
  .cell-dizhi,
  .cell-bamen,
  .cell-jiuxing {
    font-size: 12px;
  }
}
</style>

