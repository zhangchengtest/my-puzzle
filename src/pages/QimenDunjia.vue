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
        <div class="question-group">
          <label>求测事项：</label>
          <textarea 
            v-model="question" 
            placeholder="请输入您想要求测的事情，例如：工作、感情、财运、健康等"
            class="question-input"
            rows="3"
          ></textarea>
          <button @click="analyzePan" class="btn-analyze" :disabled="!panData || !question">开始分析</button>
        </div>
      </div>

      <div class="pan-section" v-if="panData">
        <div class="pan-content">
          <div class="jiugong-grid">
              <div 
                v-for="(cell, index) in panData.grid" 
                :key="index"
                class="grid-cell"
                :class="getCellClass(cell)"
              >
                <div class="cell-content">
                  <div class="cell-position">
                    <span>{{ getPositionName(index) }}</span>
                    <span class="position-number">{{ cell.position }}</span>
                    <span class="position-label">八卦</span>
                  </div>
                  <div class="cell-bashen" v-if="cell.bashen">
                    <span>{{ cell.bashen }}</span>
                    <span class="info-label">神</span>
                  </div>
                  
                  <!-- 空行分隔 -->
                  <div class="section-divider"></div>
                  
                  <!-- 天盘部分 -->
                  <div class="tianpan-section">
                    <div class="cell-tiangan-tianpan">
                      <span>{{ cell.tianganTianPan }}</span>
                      <span class="info-label">天盘天干</span>
                    </div>
                    <div class="cell-bamen-tianpan" v-if="cell.bamenTianPan">
                      <span>{{ cell.bamenTianPan }}</span>
                      <span class="info-label">天盘门</span>
                      <span v-if="cell.isZhiShiMen" class="zhi-shi-label">值使</span>
                    </div>
                    <div class="cell-jiuxing-tianpan" v-if="cell.jiuxingTianPan">
                      <span>{{ cell.jiuxingTianPan }}</span>
                      <span class="info-label">天盘星</span>
                    </div>
                  </div>
                  
                  <!-- 空行分隔 -->
                  <div class="section-divider"></div>
                  
                  <!-- 地盘部分 -->
                  <div class="dipan-section">
                    <div class="cell-tiangan">
                      <span>{{ cell.tianganDiPan }}</span>
                      <span class="info-label">地盘天干</span>
                    </div>
                    <div class="cell-bamen" v-if="cell.bamenDiPan">
                      <span>{{ cell.bamenDiPan }}</span>
                      <span class="info-label">地盘门</span>
                    </div>
                    <div class="cell-jiuxing-dipan" v-if="cell.jiuxingDiPan">
                      <span>{{ cell.jiuxingDiPan }}</span>
                      <span class="info-label">地盘星</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="analysis-result" v-if="analysisResult">
              <h3>分析结果</h3>
              <div class="result-content">
                <div class="result-question">
                  <strong>求测事项：</strong>{{ question }}
                </div>
                <div class="result-analysis">
                  <div v-for="(item, index) in analysisResult.items" :key="index" class="result-item">
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.content }}</p>
                  </div>
                </div>
                <div class="result-summary">
                  <h4>综合建议</h4>
                  <p>{{ analysisResult.summary }}</p>
                </div>
              </div>
            </div>
        </div>

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
            <span class="label">节气：</span>
            <span>{{ panData.solarTerm }}</span>
          </div>
          <div class="info-item">
            <span class="label">元：</span>
            <span>{{ panData.currentYuan }}</span>
          </div>
          <div class="info-item">
            <span class="label">时辰：</span>
            <span>{{ panData.timeBranch }}</span>
          </div>
          <div class="info-item">
            <span class="label">时干支：</span>
            <span>{{ panData.timeGanZhi }}</span>
          </div>
          <div class="info-item">
            <span class="label">旬首：</span>
            <span>{{ panData.xunShou }}</span>
          </div>
          <div class="info-item">
            <span class="label">日干支：</span>
            <span>{{ panData.dayGanZhi }}</span>
          </div>
          <div class="info-item">
            <span class="label">局数：</span>
            <span>{{ panData.dunType }}{{ panData.juNumber }}局</span>
          </div>
          <div class="info-item sanqi-liuyi-wrapper" v-if="panData.sanQiLiuYiMap">
            <div class="sanqi-liuyi-table">
              <h4>三奇六仪对应宫位</h4>
              <table class="sanqi-table">
                <thead>
                  <tr>
                    <th v-for="(gong, tiangan) in panData.sanQiLiuYiMap" :key="tiangan">{{ tiangan }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td v-for="(gong, tiangan) in panData.sanQiLiuYiMap" :key="tiangan">{{ gong }}宫</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="info-item" v-if="panData.zhiFuStar">
            <span class="label">值符星：</span>
            <span>{{ panData.zhiFuStar }}星</span>
          </div>
          <div class="info-item" v-if="panData.zhiFuPosition">
            <span class="label">值符落宫：</span>
            <span>{{ panData.zhiFuPosition }}宫</span>
          </div>
          <div class="info-item" v-if="panData.juNumber !== undefined">
            <span class="label">局数：</span>
            <span>{{ panData.juNumber }}</span>
          </div>
          <div class="info-item" v-if="panData.timeGanXuShu !== undefined">
            <span class="label">时干在三奇六仪中序数：</span>
            <span>{{ panData.timeGanXuShu }}</span>
          </div>
          <div class="info-item" v-if="panData.juNumber !== undefined && panData.timeGanXuShu !== undefined">
            <span class="label">值符落宫计算：</span>
            <span>{{ panData.juNumber }} + {{ panData.timeGanXuShu }} - 1 = {{ panData.zhiFuPosition }}</span>
          </div>
          <div class="info-item" v-if="panData.zhiShiMen">
            <span class="label">值使门：</span>
            <span>{{ panData.zhiShiMen }}门</span>
          </div>
          <div class="info-item" v-if="panData.zhiShiMenPosition">
            <span class="label">值使落宫：</span>
            <span>{{ panData.zhiShiMenPosition }}宫</span>
          </div>
          <div class="info-item" v-if="panData.zhiShiMenXuShu !== undefined">
            <span class="label">值使序数：</span>
            <span>{{ panData.zhiShiMenXuShu }}</span>
          </div>
          <div class="info-item" v-if="panData.timeGanXuShuInTianGan !== undefined">
            <span class="label">时干在十天干中序数：</span>
            <span>{{ panData.timeGanXuShuInTianGan }}</span>
          </div>
          <div class="info-item" v-if="panData.zhiShiMenXuShu !== undefined && panData.timeGanXuShuInTianGan !== undefined">
            <span class="label">值使落宫计算：</span>
            <span>{{ panData.zhiShiMenXuShu }} + {{ panData.timeGanXuShuInTianGan }} - 1 = {{ panData.zhiShiMenPosition }}</span>
          </div>
          <div class="info-item" v-if="panData.zhiShiMenMoveSteps !== undefined">
            <span class="label">值使门移动步数：</span>
            <span>{{ panData.zhiShiMenMoveSteps }}步</span>
          </div>
          <div class="info-item" v-if="panData.zhiFuTianganMoveSteps !== undefined">
            <span class="label">值符天干移动步数：</span>
            <span>{{ panData.zhiFuTianganMoveSteps }}步</span>
          </div>
          <div class="info-item" v-if="panData.zhiFuStarMoveSteps !== undefined">
            <span class="label">值符星移动步数：</span>
            <span>{{ panData.zhiFuStarMoveSteps }}步</span>
          </div>
          <div class="info-item" v-if="panData.currentDate">
            <span class="label">当前日期时间：</span>
            <span>{{ panData.currentDate }}</span>
          </div>
          <div class="info-item" v-if="panData.termDate">
            <span class="label">节气日期时间：</span>
            <span>{{ panData.termDate }}</span>
          </div>
        </div>

        <!-- 排盘规则 -->
        <div class="pan-rules-section">
          <PanRules />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentSolarTermWithDate, getCurrentSolarTerm, calculate } from '@/utils/solarTerm';
import PanRules from './components/PanRules.vue';

export default {
  name: 'QimenDunjia',
  components: {
    PanRules
  },
  data() {
    return {
      selectedDateTime: '',
      panData: null,
      question: '',
      analysisResult: null
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
      const minute = date.getMinutes();
      
      // 计算农历（简化版，实际应该使用农历库）
      const lunarDate = this.getLunarDate(year, month, day);
      
      // 计算时辰
      const timeBranch = this.getTimeBranch(hour);
      
      // 计算日干支（用于茅山法确定局数）
      const dayGanZhi = this.getDayGanZhi(year, month, day);
      
      // 计算节气（显示上一个和上上一个节气）
      const solarTerm = this.getRecentSolarTerms(year, month, day);
      
      // 计算局数（茅山法）
      const juResult = this.calculateJuNumberByMaoshan(year, month, day, dayGanZhi, hour, minute);
      const juNumber = juResult.juNumber;
      const dunType = juResult.dunType; // 阳遁或阴遁
      const yuanType = juResult.yuanType; // 上元、中元、下元
      const currentDate = juResult.currentDate; // 当前日期时间
      const termDate = juResult.termDate; // 节气日期时间
      
      // 获取当前所属的节气名称和元
      const currentYuan = this.getCurrentYuan(year, month, day, yuanType);
      
      // 计算时干支（用于确定值符）
      const timeGanZhi = this.getTimeGanZhi(year, month, day, hour);
      
      // 确定旬首
      const xunShouInfo = this.getXunShou(timeGanZhi);
      const xunShou = `${xunShouInfo.ganZhi}（${xunShouInfo.liuYi}）`;
      
      // 生成九宫格数据
      const gridResult = this.generateGrid(juNumber, hour, timeGanZhi, dunType);
      const grid = gridResult.grid;
      
      // 值使门名称已经在generateGrid中从地盘确定，直接使用
      const zhiShiMen = gridResult.zhiShiMen || '';
      
      // 格式化日期时间显示
      const formatDateTime = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}:${s}`;
      };

      // 计算三奇六仪对应宫位
      const sanQiLiuYiMap = this.calculateSanQiLiuYiMap(juNumber, dunType);

      this.panData = {
        solarDate: `${year}年${month}月${day}日 ${hour}时`,
        lunarDate: lunarDate,
        timeBranch: timeBranch,
        timeGanZhi: timeGanZhi,
        xunShou: xunShou,
        solarTerm: solarTerm,
        currentYuan: currentYuan,
        dayGanZhi: dayGanZhi,
        juNumber: gridResult.juNumber,
        dunType: dunType,
        zhiFuStar: gridResult.zhiFuStar,
        zhiFuPosition: gridResult.zhiFuPosition,
        timeGanXuShu: gridResult.timeGanXuShu,
        zhiShiMen: zhiShiMen,
        zhiShiMenXuShu: gridResult.zhiShiMenXuShu,
        timeGanXuShuInTianGan: gridResult.timeGanXuShuInTianGan,
        zhiShiMenPosition: gridResult.zhiShiMenPosition,
        zhiShiMenMoveSteps: gridResult.zhiShiMenMoveSteps,
        zhiFuTianganMoveSteps: gridResult.zhiFuTianganMoveSteps,
        zhiFuStarMoveSteps: gridResult.zhiFuStarMoveSteps,
        currentDate: formatDateTime(currentDate),
        termDate: formatDateTime(termDate),
        grid: grid,
        sanQiLiuYiMap: sanQiLiuYiMap
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
    // 计算日干支
    getDayGanZhi(year, month, day) {
      // 使用已知的准确日期作为基准：2025年12月24日是丁卯日
      // 丁卯：天干索引3，地支索引3
      const baseDate = new Date(2025, 11, 24); // 2025年12月24日，丁卯日
      const baseGanIndex = 3; // 丁
      const baseZhiIndex = 3; // 卯
      
      const targetDate = new Date(year, month - 1, day);
      const daysDiff = Math.floor((targetDate - baseDate) / 86400000);
      
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 计算目标日期的干支索引
      const ganIndex = ((baseGanIndex + daysDiff) % 10 + 10) % 10;
      const zhiIndex = ((baseZhiIndex + daysDiff) % 12 + 12) % 12;
      
      return gan[ganIndex] + zhi[zhiIndex];
    },
    // 茅山法确定局数
    calculateJuNumberByMaoshan(year, month, day, dayGanZhi, hour = 0, minute = 0) {
      // 获取当前日期所属的节气及其日期
      const currentTermInfo = this.getCurrentSolarTermWithDate(year, month, day, hour, minute);
      const currentTerm = currentTermInfo.name;
      const termDate = currentTermInfo.date;
      
      // 判断是阳遁还是阴遁（根据节气）
      // 阳遁节气：冬至、小寒、大寒、立春、雨水、惊蛰、春分、清明、谷雨、立夏、小满、芒种
      // 阴遁节气：夏至、小暑、大暑、立秋、处暑、白露、秋分、寒露、霜降、立冬、小雪、大雪
      const yangDunTerms = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
      const isYangDun = yangDunTerms.includes(currentTerm);
      
      // 茅山法：根据日干支确定局数
      // 阳遁上元：甲子、己卯、甲午、己酉 → 1局
      // 阳遁中元：甲戌、己丑、甲辰、己未 → 4局
      // 阳遁下元：甲申、己亥、甲寅、己巳 → 7局
      // 阴遁上元：甲子、己卯、甲午、己酉 → 9局
      // 阴遁中元：甲戌、己丑、甲辰、己未 → 6局
      // 阴遁下元：甲申、己亥、甲寅、己巳 → 3局
      
      const gan = dayGanZhi[0];
      const zhi = dayGanZhi[1];
      
      // 判断是上元、中元还是下元（根据节气内的天数）
      let yuanType = ''; // 上元、中元、下元
      
      // 计算当前日期距离该节气开始的时间（考虑时分）
      const currentDate = new Date(year, month - 1, day, hour, minute);
      const daysInTerm = Math.floor((currentDate - termDate) / 86400000) + 1;
      // 根据天数判断元类型
      // 1-5天：上元
      // 6-10天：中元
      // 11-15天：下元
      if (daysInTerm >= 1 && daysInTerm <= 5) {
        yuanType = '上元';
      } else if (daysInTerm >= 6 && daysInTerm <= 10) {
        yuanType = '中元';
      } else if (daysInTerm >= 11 && daysInTerm <= 15) {
        yuanType = '下元';
      } else {
        // 如果超过15天，说明已经进入下一个节气，需要重新计算
        // 这种情况理论上不应该出现，但作为容错处理
        // 使用模15的方式处理
        const cycleDay = ((daysInTerm - 1) % 15) + 1;
        if (cycleDay <= 5) {
          yuanType = '上元';
        } else if (cycleDay <= 10) {
          yuanType = '中元';
        } else {
          yuanType = '下元';
        }
      }
      
      // 根据元类型、阴阳遁和具体节气确定局数
      // 口诀：
      // 阳遁：冬至惊蛰一七四，小寒二八五，大寒春分三九六，立春八五二。
      //       雨水九六三，清明立夏四一七，谷雨小满五二八，芒种六三九。
      // 阴遁：夏至白露九三六，小暑八二五，大暑秋分七一四，立秋二五八。
      //       处暑一四七，霜降小雪五八二，寒露立冬六九三，大雪四七一。
      
      let juNumber;
      if (isYangDun) {
        // 阳遁：根据节气和元类型确定局数
        juNumber = this.getYangDunJuNumber(currentTerm, yuanType);
      } else {
        // 阴遁：根据节气和元类型确定局数
        juNumber = this.getYinDunJuNumber(currentTerm, yuanType);
      }
      
      return {
        juNumber: juNumber,
        dunType: isYangDun ? '阳遁' : '阴遁',
        yuanType: yuanType,
        currentDate: currentDate,
        termDate: termDate
      };
    },
    // 获取当前日期所属的节气名称和日期
    getCurrentSolarTermWithDate(year, month, day, hour = 0, minute = 0) {
      return getCurrentSolarTermWithDate(year, month, day, hour, minute);
    },
    // 获取当前日期所属的节气名称
    getCurrentSolarTerm(year, month, day) {
      return getCurrentSolarTerm(year, month, day);
    },
    // 获取阳遁节气的局数（根据口诀）
    // 阳遁：冬至惊蛰一七四，小寒二八五，大寒春分三九六，立春八五二。
    //       雨水九六三，清明立夏四一七，谷雨小满五二八，芒种六三九。
    getYangDunJuNumber(termName, yuanType) {
      const juMap = {
        '冬至': { '上元': 1, '中元': 7, '下元': 4 },
        '惊蛰': { '上元': 1, '中元': 7, '下元': 4 },
        '小寒': { '上元': 2, '中元': 8, '下元': 5 },
        '大寒': { '上元': 3, '中元': 9, '下元': 6 },
        '春分': { '上元': 3, '中元': 9, '下元': 6 },
        '立春': { '上元': 8, '中元': 5, '下元': 2 },
        '雨水': { '上元': 9, '中元': 6, '下元': 3 },
        '清明': { '上元': 4, '中元': 1, '下元': 7 },
        '立夏': { '上元': 4, '中元': 1, '下元': 7 },
        '谷雨': { '上元': 5, '中元': 2, '下元': 8 },
        '小满': { '上元': 5, '中元': 2, '下元': 8 },
        '芒种': { '上元': 6, '中元': 3, '下元': 9 }
      };
      
      return juMap[termName]?.[yuanType] || 1;
    },
    // 获取阴遁节气的局数（根据口诀）
    // 阴遁：夏至白露九三六，小暑八二五，大暑秋分七一四，立秋二五八。
    //       处暑一四七，霜降小雪五八二，寒露立冬六九三，大雪四七一。
    getYinDunJuNumber(termName, yuanType) {
      const juMap = {
        '夏至': { '上元': 9, '中元': 3, '下元': 6 },
        '白露': { '上元': 9, '中元': 3, '下元': 6 },
        '小暑': { '上元': 8, '中元': 2, '下元': 5 },
        '大暑': { '上元': 7, '中元': 1, '下元': 4 },
        '秋分': { '上元': 7, '中元': 1, '下元': 4 },
        '立秋': { '上元': 2, '中元': 5, '下元': 8 },
        '处暑': { '上元': 1, '中元': 4, '下元': 7 },
        '霜降': { '上元': 5, '中元': 8, '下元': 2 },
        '小雪': { '上元': 5, '中元': 8, '下元': 2 },
        '寒露': { '上元': 6, '中元': 9, '下元': 3 },
        '立冬': { '上元': 6, '中元': 9, '下元': 3 },
        '大雪': { '上元': 4, '中元': 7, '下元': 1 }
      };
      
      return juMap[termName]?.[yuanType] || 9;
    },
    // 获取当前所属的节气和元
    getCurrentYuan(year, month, day, yuanType) {
      // 找到当前日期所属的节气（最近的已过去的节气）
      const allTerms = [
        { name: '立春', month: 2, day: 4 },
        { name: '雨水', month: 2, day: 19 },
        { name: '惊蛰', month: 3, day: 6 },
        { name: '春分', month: 3, day: 21 },
        { name: '清明', month: 4, day: 5 },
        { name: '谷雨', month: 4, day: 20 },
        { name: '立夏', month: 5, day: 6 },
        { name: '小满', month: 5, day: 21 },
        { name: '芒种', month: 6, day: 6 },
        { name: '夏至', month: 6, day: 21 },
        { name: '小暑', month: 7, day: 7 },
        { name: '大暑', month: 7, day: 23 },
        { name: '立秋', month: 8, day: 8 },
        { name: '处暑', month: 8, day: 23 },
        { name: '白露', month: 9, day: 8 },
        { name: '秋分', month: 9, day: 23 },
        { name: '寒露', month: 10, day: 8 },
        { name: '霜降', month: 10, day: 23 },
        { name: '立冬', month: 11, day: 8 },
        { name: '小雪', month: 11, day: 22 },
        { name: '大雪', month: 12, day: 7 },
        { name: '冬至', month: 12, day: 21 },
        { name: '小寒', month: 1, day: 6 },
        { name: '大寒', month: 1, day: 20 }
      ];
      
      const currentDate = new Date(year, month - 1, day);
      
      // 找到最近的已过去的节气和下一个节气
      let currentTerm = null;
      let nextTerm = null;
      let minDaysDiff = Infinity;
      let minFutureDaysDiff = Infinity;
      
      for (let term of allTerms) {
        let termDate = new Date(year, term.month - 1, term.day);
        
        // 处理跨年
        if (month === 1 && term.month === 12) {
          termDate = new Date(year - 1, term.month - 1, term.day);
        }
        if (month === 12 && term.month === 1) {
          termDate = new Date(year + 1, term.month - 1, term.day);
        }
        
        const daysDiff = Math.floor((currentDate - termDate) / 86400000);
        
        // 找到已过去且最接近的节气
        if (daysDiff >= 0 && daysDiff < minDaysDiff && daysDiff < 15) {
          minDaysDiff = daysDiff;
          currentTerm = term;
        }
        
        // 找到未来的且最接近的节气
        if (daysDiff < 0 && Math.abs(daysDiff) < minFutureDaysDiff) {
          minFutureDaysDiff = Math.abs(daysDiff);
          nextTerm = term;
        }
      }
      
      // 如果找不到当前节气，使用简化处理
      if (!currentTerm) {
        // 简化处理：根据月份判断
        if (month === 12 && day >= 21) {
          currentTerm = { name: '冬至' };
        } else if (month === 12 && day >= 7) {
          currentTerm = { name: '大雪' };
        } else if (month === 11 && day >= 22) {
          currentTerm = { name: '小雪' };
        } else if (month === 11 && day >= 8) {
          currentTerm = { name: '立冬' };
        } else {
          currentTerm = { name: '冬至' }; // 默认
        }
      }
      
      // 如果找不到下一个节气，根据当前节气推算
      if (!nextTerm && currentTerm) {
        const currentIndex = allTerms.findIndex(t => t.name === currentTerm.name);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allTerms.length;
          nextTerm = allTerms[nextIndex];
        }
      }
      
      // 格式化显示：当前节气的元（下一个节气+日期）
      let result = currentTerm ? `${currentTerm.name}${yuanType}` : `${yuanType}`;
      if (nextTerm) {
        result += `（${nextTerm.name}${nextTerm.month}月${nextTerm.day}日）`;
      }
      
      return result;
    },
    // 计算一年中的第几天
    getDayOfYear(year, month, day) {
      const startOfYear = new Date(year, 0, 1);
      const currentDate = new Date(year, month - 1, day);
      return Math.floor((currentDate - startOfYear) / 86400000) + 1;
    },
    // 判断是否是闰年
    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },
    getSolarTerm(year, month, day) {
      // 简化版节气判断
      // 实际应该精确计算节气
      // 返回0-5表示阳遁（冬至后到夏至前），6-11表示阴遁（夏至后到冬至前）
      // 冬至通常在12月21-23日，夏至通常在6月21-23日
      
      // 12月、1月、2月：冬至后，阳遁
      if (month === 12 || month === 1 || month === 2) {
        return 0; // 阳遁
      }
      // 6月、7月、8月：夏至后，阴遁
      if (month === 6 || month === 7 || month === 8) {
        return 6; // 阴遁
      }
      // 3月、4月、5月：春分后，阳遁
      if (month === 3 || month === 4 || month === 5) {
        return 3; // 阳遁
      }
      // 9月、10月、11月：秋分后，阴遁
      return 9; // 阴遁
    },
    // 获取最近的节气（上一个和上上一个）
    getRecentSolarTerms(year, month, day) {
      // 使用精确的节气计算工具
      const currentDate = new Date(year, month - 1, day);
      
      // 获取当前年份、上一年和下一年所有节气
      const currentYearTerms = calculate(year);
      const prevYearTerms = calculate(year - 1);
      const nextYearTerms = calculate(year + 1);
      
      // 合并所有相关节气
      const allTerms = [];
      
      // 添加上一年的后几个节气（用于处理跨年）
      for (const [name, date] of prevYearTerms) {
        if (date.getFullYear() === year - 1 && date.getMonth() >= 10) {
          allTerms.push({ name, date });
        }
      }
      
      // 添加当前年的所有节气
      for (const [name, date] of currentYearTerms) {
        allTerms.push({ name, date });
      }
      
      // 添加下一年的前几个节气（用于处理跨年）
      for (const [name, date] of nextYearTerms) {
        if (date.getFullYear() === year + 1 && date.getMonth() < 2) {
          allTerms.push({ name, date });
        }
      }
      
      // 按时间排序
      allTerms.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // 计算每个节气相对于当前日期的天数差（负数表示已过去）
      const termsWithDiff = allTerms.map(term => {
        const daysDiff = Math.floor((term.date.getTime() - currentDate.getTime()) / 86400000);
        return {
          name: term.name,
          date: term.date,
          month: term.date.getMonth() + 1,
          day: term.date.getDate(),
          daysDiff: daysDiff
        };
      });
      
      // 找到已过去的最近两个节气（daysDiff < 0，且最接近0）
      const pastTerms = termsWithDiff
        .filter(term => term.daysDiff < 0)
        .sort((a, b) => b.daysDiff - a.daysDiff); // 按daysDiff降序排列（最接近0的在前面）
      
      let lastTerm = null;
      let secondLastTerm = null;
      
      if (pastTerms.length > 0) {
        lastTerm = pastTerms[0]; // 上一个节气
      }
      if (pastTerms.length > 1) {
        secondLastTerm = pastTerms[1]; // 上上一个节气
      }
      
      // 格式化显示
      let result = '';
      if (lastTerm) {
        result = `${lastTerm.month}月${lastTerm.day}日${lastTerm.name}`;
      }
      if (secondLastTerm) {
        if (result) result += '，';
        result += `${secondLastTerm.month}月${secondLastTerm.day}日${secondLastTerm.name}`;
      }
      
      return result || '未知';
    },
    // 计算时干支
    getTimeGanZhi(year, month, day, hour) {
      // 计算日干支
      const dayGanZhi = this.getDayGanZhi(year, month, day);
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      const dayGanIndex = gan.indexOf(dayGanZhi[0]);
      
      // 计算时辰的地支索引
      const timeZhiIndex = Math.floor((hour + 1) / 2) % 12;
      
      // 时干计算公式：根据日干确定子时的时干，然后按顺序推算
      // 甲己日：子时为甲子（时干索引0）
      // 乙庚日：子时为丙子（时干索引2）
      // 丙辛日：子时为戊子（时干索引4）
      // 丁壬日：子时为庚子（时干索引6）
      // 戊癸日：子时为壬子（时干索引8）
      
      let ziShiGanIndex;
      if (dayGanIndex === 0 || dayGanIndex === 5) {
        // 甲己日
        ziShiGanIndex = 0; // 甲
      } else if (dayGanIndex === 1 || dayGanIndex === 6) {
        // 乙庚日
        ziShiGanIndex = 2; // 丙
      } else if (dayGanIndex === 2 || dayGanIndex === 7) {
        // 丙辛日
        ziShiGanIndex = 4; // 戊
      } else if (dayGanIndex === 3 || dayGanIndex === 8) {
        // 丁壬日
        ziShiGanIndex = 6; // 庚
      } else {
        // 戊癸日（dayGanIndex === 4 || dayGanIndex === 9）
        ziShiGanIndex = 8; // 壬
      }
      
      // 根据子时的时干和当前时支计算时干
      const timeGanIndex = (ziShiGanIndex + timeZhiIndex) % 10;
      
      return gan[timeGanIndex] + zhi[timeZhiIndex];
    },
    // 确定旬首
    getXunShou(timeGanZhi) {
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      const timeGanIndex = gan.indexOf(timeGanZhi[0]);
      const timeZhiIndex = zhi.indexOf(timeGanZhi[1]);
      
      // 计算旬首：找到最近的甲日
      let xunShouGanIndex = timeGanIndex;
      let xunShouZhiIndex = timeZhiIndex;
      
      // 向前找，直到找到甲日
      while (xunShouGanIndex % 10 !== 0) {
        xunShouGanIndex = (xunShouGanIndex - 1 + 10) % 10;
        xunShouZhiIndex = (xunShouZhiIndex - 1 + 12) % 12;
      }
      
      const xunShou = gan[xunShouGanIndex] + zhi[xunShouZhiIndex];
      
      // 确定旬首对应的六仪
      const liuYiMap = {
        '甲子': '戊',
        '甲戌': '己',
        '甲申': '庚',
        '甲午': '辛',
        '甲辰': '壬',
        '甲寅': '癸'
      };
      
      return {
        ganZhi: xunShou,
        liuYi: liuYiMap[xunShou] || '戊'
      };
    },
    generateGrid(juNumber, hour, timeGanZhi, dunType) {
      // 天干
      const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      // 地支
      const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      // 八门的原始位置（地盘）
      // 休门在坎1宫，死门在坤2宫，伤门在震3宫，杜门在巽4宫
      // 开门在乾6宫，惊门在兑7宫，生门在艮8宫，景门在离9宫
      // 中5宫没有门
      const baMenDiPanMap = {
        1: '休', 2: '死', 3: '伤', 4: '杜',
        6: '开', 7: '惊', 8: '生', 9: '景'
      };
      // 九星（按宫位顺序：坎1、坤2、震3、巽4、中5、乾6、兑7、艮8、离9）
      const jiuXing = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
      // 八神
      const baShen = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
      
      // 九宫格位置（洛书顺序）
      const positions = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 巽4、离9、坤2、震3、中5、兑7、艮8、坎1、乾6
      
      // 1. 确定旬首
      const xunShou = this.getXunShou(timeGanZhi);
      
      // 2. 定位旬首所遁六仪在地盘的位置
      const isYangDun = dunType === '阳遁';
      
      // 六仪在地盘的排布顺序
      const liuYiOrder = ['戊', '己', '庚', '辛', '壬', '癸'];
      const liuYiIndex = liuYiOrder.indexOf(xunShou.liuYi);
      
      // 根据局数和阴阳遁，确定六仪在地盘的起始位置
      // 阳遁：从局数对应的宫位开始，六仪三奇按照1->2->3->4->5->6->7->8->9->1的顺序顺行排布
      // 阴遁：从局数对应的宫位开始，六仪三奇按照1->9->8->7->6->5->4->3->2->1的顺序逆行排布
      // 例如：阳遁1局，戊在1宫，己在2宫，...，乙在9宫
      //      阳遁2局，戊在2宫，己在3宫，...，乙在1宫
      //      阴遁1局，戊在1宫，己在9宫，庚在8宫，...，乙在2宫
      //      阴遁2局，戊在2宫，己在1宫，庚在9宫，...，乙在3宫
      
      // 计算旬首六仪在地盘的宫位
      // 六仪三奇顺序：戊、己、庚、辛、壬、癸、丁、丙、乙（索引0-8）
      let diPanGong;
      if (isYangDun) {
        // 阳遁：顺行，戊从局数对应的宫位开始
        // 例如：局1，戊在1宫，己在2宫，...，乙在9宫
        //      局2，戊在2宫，己在3宫，...，乙在1宫
        diPanGong = ((juNumber - 1 + liuYiIndex) % 9) + 1;
        if (diPanGong === 0) diPanGong = 9;
      } else {
        // 阴遁：逆行，戊从局数对应的宫位开始
        // 例如：局1，戊在1宫，己在9宫，庚在8宫，...，乙在2宫
        //      局2，戊在2宫，己在1宫，庚在9宫，...，乙在3宫
        diPanGong = ((juNumber - 1 - liuYiIndex + 9) % 9) + 1;
        if (diPanGong === 0) diPanGong = 9;
      }

      
      // 3. 确定值符九星（该宫位的本位星）
      const gongToStar = {
        1: '天蓬', 2: '天芮', 3: '天冲', 4: '天辅', 5: '天禽',
        6: '天心', 7: '天柱', 8: '天任', 9: '天英'
      };
      const zhiFuStar = gongToStar[diPanGong];
      
      // 3.5. 确定值使门（根据旬首六仪在地盘的宫位）
      // 值使门是旬首对应的六仪在地盘所在宫位的本位门
      // diPanGong 就是旬首六仪在地盘的宫位
      // 根据宫位找到对应的本位门
      const gongToMen = {
        1: '休', 2: '死', 3: '伤', 4: '杜',
        6: '开', 7: '惊', 8: '生', 9: '景'
      };
      const zhiShiMen = gongToMen[diPanGong] || '休';
      // 4. 值符跟随时干落宫（天盘）
      // 公式：直符落宫数 = 局数 + 时干在三奇六仪中所对应的次序数 - 1
      // 三奇六仪次序数：
      // 阳遁：戊1、己2、庚3、辛4、壬5、癸6、丁7、丙8、乙9
      // 阴遁：戊1、己9、庚8、辛7、壬6、癸5、丁4、丙3、乙2
      const timeGan = timeGanZhi[0];
      const liuYiSanQiOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
      const timeGanOrderIndex = liuYiSanQiOrder.indexOf(timeGan);
      
      let timeGanXuShu; // 时干在三奇六仪中的次序数
      if (timeGanOrderIndex >= 0) {
        if (isYangDun) {
          // 阳遁：戊1、己2、庚3、辛4、壬5、癸6、丁7、丙8、乙9
          timeGanXuShu = timeGanOrderIndex + 1;
        } else {
          // 阴遁：戊1、己9、庚8、辛7、壬6、癸5、丁4、丙3、乙2
          if (timeGanOrderIndex === 0) {
            timeGanXuShu = 1; // 戊
          } else if (timeGanOrderIndex <= 5) {
            // 己、庚、辛、壬、癸 -> 9、8、7、6、5
            timeGanXuShu = 11 - timeGanOrderIndex;
          } else {
            // 丁、丙、乙 -> 4、3、2
            timeGanXuShu = 13 - timeGanOrderIndex;
          }
        }
      } else {
        // 时干是甲，甲隐藏于六仪中，使用旬首对应的六仪
        // 甲子->戊(1), 甲戌->己, 甲申->庚, 甲午->辛, 甲辰->壬, 甲寅->癸
        const xunShouGanZhi = xunShou.ganZhi;
        const xunShouToXuShu = {
          '甲子': 1, '甲戌': isYangDun ? 2 : 9, '甲申': isYangDun ? 3 : 8,
          '甲午': isYangDun ? 4 : 7, '甲辰': isYangDun ? 5 : 6,
          '甲寅': isYangDun ? 6 : 5
        };
        timeGanXuShu = xunShouToXuShu[xunShouGanZhi] || 1;
      }
      
      // 计算值符落宫数：直符落宫数 = 局数 + 时干在三奇六仪中所对应的次序数 - 1
      let zhiFuPosition = juNumber + timeGanXuShu - 1;
      // 处理超过9的情况，需要模9运算，但宫位是1-9
      if (zhiFuPosition > 9) {
        zhiFuPosition = ((zhiFuPosition - 1) % 9) + 1;
      }
      if (zhiFuPosition === 0) {
        zhiFuPosition = 9;
      }
      
     
      // zhiShiMenXuShu 就是 zhiShiMen 的宫位数字
      // 由于 zhiShiMen = gongToMen[diPanGong]，所以 zhiShiMenXuShu 就是 diPanGong
      const zhiShiMenXuShu = diPanGong; // 值使门宫位数字
      
      // 计算时干在十天干中的序数
      const tianGanOrder = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const timeGanIndexInTianGan = tianGanOrder.indexOf(timeGan);
      let timeGanXuShuInTianGan; // 时干在十天干中的序数
      if (isYangDun) {
        // 阳遁：甲1、乙2、丙3、丁4、戊5、己6、庚7、辛8、壬9、癸10
        timeGanXuShuInTianGan = timeGanIndexInTianGan + 1;
      } else {
        // 阴遁：甲10、乙9、丙8、丁7、戊6、己5、庚4、辛3、壬2、癸1
        timeGanXuShuInTianGan = 10 - timeGanIndexInTianGan;
      }
      
      // 计算值使落宫数
      let zhiShiMenPosition = zhiShiMenXuShu + timeGanXuShuInTianGan - 1;
      // 处理超过9的情况，需要模9运算，但宫位是1-9
      if (zhiShiMenPosition > 9) {
        zhiShiMenPosition = ((zhiShiMenPosition - 1) % 9) + 1;
      }
      if (zhiShiMenPosition === 0) {
        zhiShiMenPosition = 9;
      }
      
      // 调试信息
      console.log('值符计算详情:', {
        timeGanZhi,
        timeGan,
        xunShou: xunShou.ganZhi,
        xunShouLiuYi: xunShou.liuYi,
        juNumber,
        dunType,
        liuYiIndex,
        diPanGong,
        zhiFuStar,
        zhiShiMen,
        zhiShiMenXuShu,
        timeGanOrderIndex,
        timeGanXuShu,
        timeGanXuShuInTianGan,
        zhiFuPosition,
        zhiShiMenPosition
      });
      
      // 计算每个宫位的天干（地盘）
      const getTianganByGong = (gong) => {
        // 九宫顺序：1坎、2坤、3震、4巽、5中、6乾、7兑、8艮、9离
        // 六仪三奇顺序：戊、己、庚、辛、壬、癸、丁、丙、乙（索引0-8）
        // 计算该宫位在六仪三奇序列中的索引
        let orderIndex;
        if (isYangDun) {
          // 阳遁：从局数对应的宫位开始，六仪三奇按照1->2->3->4->5->6->7->8->9->1的顺序顺行排布
          // 例如：阳遁1局，gong=1时，戊（索引0）；gong=2时，己（索引1）；...；gong=9时，乙（索引8）
          //      阳遁2局，gong=2时，戊（索引0）；gong=3时，己（索引1）；...；gong=1时，乙（索引8）
          orderIndex = ((gong - juNumber + 9) % 9);
        } else {
          // 阴遁：从局数对应的宫位开始，六仪三奇按照1->9->8->7->6->5->4->3->2->1的顺序逆行排布
          // 例如：阴遁1局，gong=1时，戊（索引0）；gong=9时，己（索引1）；gong=8时，庚（索引2）；...；gong=2时，乙（索引8）
          //      阴遁2局，gong=2时，戊（索引0）；gong=1时，己（索引1）；gong=9时，庚（索引2）；...；gong=3时，乙（索引8）
          orderIndex = ((juNumber - gong + 9) % 9);
        }
        return liuYiSanQiOrder[orderIndex];
      };
      
      // 天干旋转顺序：与八门和九星相同 [6, 1, 8, 3, 4, 9, 2, 7]（不包括中5宫）
      const tianganOrder = [6, 1, 8, 3, 4, 9, 2, 7]; // 天干宫位顺序（不包括中5宫）
      
      // 计算值符移动的步数（从地盘到天盘）
      // 值符从 diPanGong 移动到 zhiFuPosition
      // 计算在天干顺序中的移动步数（参考八门和九星的旋转方式）
      const getTianganOrderIndex = (gong) => {
        return tianganOrder.indexOf(gong);
      };
      
      // 如果值符在地盘是5宫，需要特殊处理
      let zhiFuTianganDiPanIndex, zhiFuTianganTianPanIndex;
      if (diPanGong === 5) {
        // 值符在地盘是5宫，计算天盘位置在天干顺序中的索引
        zhiFuTianganDiPanIndex = -1; // 5宫不在天干顺序中
        zhiFuTianganTianPanIndex = getTianganOrderIndex(zhiFuPosition);
      } else {
        // 值符在地盘不是5宫，正常计算
        zhiFuTianganDiPanIndex = getTianganOrderIndex(diPanGong);
        zhiFuTianganTianPanIndex = getTianganOrderIndex(zhiFuPosition);
      }
      
      let zhiFuTianganMoveSteps = 0;
      if (zhiFuTianganDiPanIndex !== -1 && zhiFuTianganTianPanIndex !== -1) {
        zhiFuTianganMoveSteps = zhiFuTianganTianPanIndex - zhiFuTianganDiPanIndex;
        if (zhiFuTianganMoveSteps < 0) {
          zhiFuTianganMoveSteps += tianganOrder.length;
        }
      } else if (zhiFuTianganDiPanIndex === -1 && zhiFuTianganTianPanIndex !== -1) {
        // 值符在地盘是5宫，移动到天盘位置
        // 移动步数就是天盘位置在顺序中的索引
        zhiFuTianganMoveSteps = zhiFuTianganTianPanIndex;
      }
      
      // 计算每个宫位的天干（天盘）
      // 天干按照指定顺序旋转，值符从地盘位置移动到天盘位置
      // 所有天干都按照相同的步数在天干顺序中旋转（参考八门和九星的旋转方式）
      const getTianPanTianganByGong = (gong) => {
        // 如果当前宫位是值符在天盘的位置
        if (gong === zhiFuPosition) {
          // 显示值符对应的天干（地盘天干）
          return getTianganByGong(diPanGong);
        }
        
        // 如果当前宫位是5宫
        if (gong === 5) {
          // 5宫的天干跟随值符移动
          // 如果值符在地盘是5宫，那么5宫的天盘天干就是5宫的地盘天干
          // 如果值符在地盘不是5宫，那么5宫的地盘天干会跟随值符移动到天盘位置
          // 所以5宫的天盘天干应该是值符在地盘位置的天干
          return getTianganByGong(diPanGong);
        }
        
        // 找到该宫位在天干顺序中的索引
        const gongIndex = getTianganOrderIndex(gong);
        if (gongIndex === -1) {
          return null;
        }
        
        // 计算旋转后对应的原始宫位索引（逆时针旋转zhiFuTianganMoveSteps步）
        let sourceIndex = (gongIndex - zhiFuTianganMoveSteps + tianganOrder.length) % tianganOrder.length;
        
        // 获取原始宫位的地盘天干
        const sourceGong = tianganOrder[sourceIndex];
        return getTianganByGong(sourceGong);
      };
      
      // 计算每个宫位的门（地盘，固定位置）
      const getBamenDiPanByGong = (gong) => {
        return baMenDiPanMap[gong] || null;
      };
      
      // 计算值使门在地盘的宫位
      const zhiShiMenDiPanGongMap = {
        '休': 1, '死': 2, '伤': 3, '杜': 4,
        '开': 6, '惊': 7, '生': 8, '景': 9
      };
      const zhiShiMenDiPanGong = zhiShiMenDiPanGongMap[zhiShiMen] || 1;
      
      // 八门旋转顺序：开(6) -> 休(1) -> 生(8) -> 伤(3) -> 杜(4) -> 景(9) -> 死(2) -> 惊(7) -> 开(6)...
      const bamenOrder = [6, 1, 8, 3, 4, 9, 2, 7]; // 有门的宫位顺序（不包括中5宫）
      
      // 计算值使门移动的步数（从地盘到天盘）
      // 值使门从 zhiShiMenDiPanGong 移动到 zhiShiMenPosition
      // 计算在八门顺序中的移动步数
      const getBamenOrderIndex = (gong) => {
        return bamenOrder.indexOf(gong);
      };
      
      const zhiShiMenDiPanIndex = getBamenOrderIndex(zhiShiMenDiPanGong);
      const zhiShiMenTianPanIndex = getBamenOrderIndex(zhiShiMenPosition);
      let zhiShiMenMoveSteps = zhiShiMenTianPanIndex - zhiShiMenDiPanIndex;
      if (zhiShiMenMoveSteps < 0) {
        zhiShiMenMoveSteps += bamenOrder.length;
      }
      
      // 计算每个宫位的门（天盘）
      // 八门按照指定顺序旋转，值使门从地盘位置移动到天盘位置
      // 所有门都按照相同的步数在八门顺序中旋转
      const getBamenTianPanByGong = (gong) => {
        // 中5宫始终没有门
        if (gong === 5) {
          return null;
        }
        
        // 找到该宫位在八门顺序中的索引
        const gongIndex = getBamenOrderIndex(gong);
        if (gongIndex === -1) {
          return null;
        }
        
        // 计算旋转后对应的原始宫位索引（逆时针旋转zhiShiMenMoveSteps步）
        let sourceIndex = (gongIndex - zhiShiMenMoveSteps + bamenOrder.length) % bamenOrder.length;
        
        // 获取原始宫位的地盘门
        const sourceGong = bamenOrder[sourceIndex];
        return getBamenDiPanByGong(sourceGong);
      };
      
      // 计算每个宫位的星（地盘，固定位置）
      // 九星固定位置：坎1宫天蓬、坤2宫天芮、震3宫天冲、巽4宫天辅、中5宫天禽、乾6宫天心、兑7宫天柱、艮8宫天任、离9宫天英
      const getJiuxingDiPanByGong = (gong) => {
        return gongToStar[gong] || null;
      };
      
      // 九星旋转顺序：开(6)天心、休(1)天蓬、生(8)天任、伤(3)天冲、杜(4)天辅、景(9)天英、死(2)天芮、惊(7)天柱
      // 与八门顺序一致：[6, 1, 8, 3, 4, 9, 2, 7]（不包括中5宫）
      const jiuxingOrder = [6, 1, 8, 3, 4, 9, 2, 7]; // 九星宫位顺序（不包括中5宫，中5宫天禽星跟随值符星）
      
      // 计算值符星移动的步数（从地盘到天盘）
      // 值符星从 diPanGong 移动到 zhiFuPosition
      // 计算在九星顺序中的移动步数
      const getJiuxingOrderIndex = (gong) => {
        return jiuxingOrder.indexOf(gong);
      };
      
      // 如果值符星在地盘是5宫（天禽），需要特殊处理
      // 中5宫的天禽星跟随值符星移动
      let zhiFuStarDiPanIndex, zhiFuStarTianPanIndex;
      if (diPanGong === 5) {
        // 值符星在地盘是5宫（天禽），天禽星跟随值符星移动到天盘位置
        // 计算天盘位置在九星顺序中的索引
        zhiFuStarDiPanIndex = -1; // 5宫不在九星顺序中
        zhiFuStarTianPanIndex = getJiuxingOrderIndex(zhiFuPosition);
      } else {
        // 值符星在地盘不是5宫，正常计算
        zhiFuStarDiPanIndex = getJiuxingOrderIndex(diPanGong);
        zhiFuStarTianPanIndex = getJiuxingOrderIndex(zhiFuPosition);
      }
      
      let zhiFuStarMoveSteps = 0;
      if (zhiFuStarDiPanIndex !== -1 && zhiFuStarTianPanIndex !== -1) {
        zhiFuStarMoveSteps = zhiFuStarTianPanIndex - zhiFuStarDiPanIndex;
        if (zhiFuStarMoveSteps < 0) {
          zhiFuStarMoveSteps += jiuxingOrder.length;
        }
      } else if (zhiFuStarDiPanIndex === -1 && zhiFuStarTianPanIndex !== -1) {
        // 值符星在地盘是5宫，移动到天盘位置
        // 移动步数就是天盘位置在顺序中的索引
        zhiFuStarMoveSteps = zhiFuStarTianPanIndex;
      }
      
      // 计算每个宫位的星（天盘，跟随值符旋转）
      // 九星按照指定顺序旋转，值符星从地盘位置移动到天盘位置
      // 所有星都按照相同的步数在九星顺序中旋转
      // 中5宫的天禽星跟随值符星
      const getJiuxingTianPanByGong = (gong) => {
        // 如果当前宫位是值符星在天盘的位置
        if (gong === zhiFuPosition) {
          // 如果值符星在地盘是5宫（天禽），那么天盘显示天禽星
          if (diPanGong === 5) {
            return '天禽';
          }
          // 否则显示值符星本身
          return zhiFuStar;
        }
        
        // 如果当前宫位是5宫
        if (gong === 5) {
          // 中5宫的天禽星跟随值符星移动
          // 如果值符星在地盘是5宫，那么5宫的天盘星应该是跟随值符星移动的星
          // 但实际上值符星已经移动到天盘位置了，所以5宫的天盘星应该是原来值符星位置的星
          // 如果值符星在地盘不是5宫，那么5宫的地盘星是天禽星，天禽星会跟随值符星移动
          // 所以5宫的天盘星应该是按照旋转逻辑计算出来的星
          // 但5宫不在九星顺序中，需要特殊处理
          // 实际上，如果值符星在地盘不是5宫，那么5宫的地盘星是天禽星，天禽星会跟随值符星移动
          // 所以5宫的天盘星应该是按照旋转逻辑计算出来的星
          // 但5宫不在九星顺序中，所以需要找到5宫对应的原始宫位
          // 由于5宫不在九星顺序中，我们需要找到值符星移动后，5宫对应的原始宫位
          // 如果值符星从5宫移动到zhiFuPosition，那么5宫的天盘星应该是按照旋转逻辑计算
          // 实际上，如果值符星在地盘是5宫，那么5宫的天盘星应该是跟随值符星移动的星
          // 但值符星已经移动到天盘位置了，所以5宫的天盘星应该是原来值符星位置的星
          return null;
        }
        
        // 找到该宫位在九星顺序中的索引
        const gongIndex = getJiuxingOrderIndex(gong);
        if (gongIndex === -1) {
          return null;
        }
        
        // 计算旋转后对应的原始宫位索引（逆时针旋转zhiFuStarMoveSteps步）
        let sourceIndex = (gongIndex - zhiFuStarMoveSteps + jiuxingOrder.length) % jiuxingOrder.length;
        
        // 获取原始宫位的地盘星
        const sourceGong = jiuxingOrder[sourceIndex];
        return getJiuxingDiPanByGong(sourceGong);
      };
      
      const grid = [];
      
      for (let i = 0; i < 9; i++) {
        const pos = positions[i];
        const dizhiOffset = (hour + pos - 1) % 12;
        
        // 计算该宫位的天干（地盘，固定位置）
        const tianganDiPan = getTianganByGong(pos);
        
        // 计算该宫位的天干（天盘，值符移动后的位置）
        const tianganTianPan = getTianPanTianganByGong(pos);
        
        // 计算该宫位的门（地盘，固定位置）
        const bamenDiPan = getBamenDiPanByGong(pos);
        
        // 计算该宫位的门（天盘，值使门移动后的位置）
        const bamenTianPan = getBamenTianPanByGong(pos);
        
        // 计算该宫位的星（地盘，固定位置）
        const jiuxingDiPan = getJiuxingDiPanByGong(pos);
        
        // 计算该宫位的星（天盘，值符移动后的位置）
        const jiuxingTianPan = getJiuxingTianPanByGong(pos);
        
        // 确定值符是否在此宫位
        let bashen = null;
        if (pos === zhiFuPosition) {
          bashen = '值符';
        }
        
        // 确定值使门是否在此宫位（天盘位置）
        let isZhiShiMen = (pos === zhiShiMenPosition);
        // 确定值使门是否在此宫位（地盘位置）
        let isZhiShiMenDiPan = (pos === zhiShiMenDiPanGong);
        
        grid.push({
          position: pos,
          tianganDiPan: tianganDiPan,
          tianganTianPan: tianganTianPan,
          dizhi: diZhi[dizhiOffset % 12],
          bamenDiPan: bamenDiPan,
          bamenTianPan: bamenTianPan,
          jiuxingDiPan: jiuxingDiPan,
          jiuxingTianPan: jiuxingTianPan,
          jiuxing: jiuxingDiPan, // 保留原有字段以兼容，使用地盘星
          bashen: bashen,
          isZhiShiMen: isZhiShiMen, // 天盘位置
          isZhiShiMenDiPan: isZhiShiMenDiPan, // 地盘位置
          zhiShiMen: zhiShiMen
        });
      }
      
      return {
        grid: grid,
        zhiFuStar: zhiFuStar,
        zhiFuPosition: zhiFuPosition,
        juNumber: juNumber,
        timeGanXuShu: timeGanXuShu,
        zhiShiMenXuShu: zhiShiMenXuShu,
        timeGanXuShuInTianGan: timeGanXuShuInTianGan,
        zhiShiMenPosition: zhiShiMenPosition,
        zhiShiMenDiPanGong: zhiShiMenDiPanGong,
        zhiShiMen: zhiShiMen,
        zhiShiMenMoveSteps: zhiShiMenMoveSteps,
        zhiFuTianganMoveSteps: zhiFuTianganMoveSteps,
        zhiFuStarMoveSteps: zhiFuStarMoveSteps
      };
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
    },
    analyzePan() {
      if (!this.panData || !this.question) return;
      
      const grid = this.panData.grid;
      const items = [];
      
      // 1. 分析值符值使
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      if (zhiFuCell) {
        const starName = zhiFuCell.jiuxingTianPan || zhiFuCell.jiuxing;
        items.push({
          title: '值符分析',
          content: `值符在${this.getPositionNameByPosition(zhiFuCell.position)}宫，${starName}星当值，主${this.getStarMeaning(starName)}。`
        });
      }
      
      // 2. 分析八门
      const goodGates = ['开', '休', '生'];
      const badGates = ['死', '惊', '伤'];
      const gateAnalysis = grid.map(cell => {
        if (goodGates.includes(cell.bamen)) {
          return `${this.getPositionNameByPosition(cell.position)}宫${cell.bamen}门为吉门`;
        } else if (badGates.includes(cell.bamen)) {
          return `${this.getPositionNameByPosition(cell.position)}宫${cell.bamen}门为凶门`;
        }
        return null;
      }).filter(item => item !== null);
      
      if (gateAnalysis.length > 0) {
        items.push({
          title: '八门分析',
          content: gateAnalysis.join('；') + '。'
        });
      }
      
      // 3. 分析九星
      const starAnalysis = [];
      grid.forEach(cell => {
        const starName = cell.jiuxingTianPan || cell.jiuxing;
        if (starName) {
          starAnalysis.push(`${this.getPositionNameByPosition(cell.position)}宫${starName}星，${this.getStarMeaning(starName)}`);
        }
      });
      
      if (starAnalysis.length > 0) {
        items.push({
          title: '九星分析',
          content: starAnalysis.slice(0, 3).join('；') + '。'
        });
      }
      
      // 4. 根据求测事项给出针对性分析
      const questionType = this.getQuestionType(this.question);
      let specificAnalysis = '';
      
      if (questionType === 'work') {
        const workCell = grid.find(cell => cell.bamen === '开' || cell.bamen === '生');
        if (workCell) {
          specificAnalysis = `工作方面，建议关注${this.getPositionNameByPosition(workCell.position)}宫，${workCell.bamen}门主${this.getGateMeaning(workCell.bamen)}，有利于事业发展。`;
        }
      } else if (questionType === 'love') {
        const loveCell = grid.find(cell => cell.bamen === '休' || cell.bamen === '生');
        if (loveCell) {
          specificAnalysis = `感情方面，${this.getPositionNameByPosition(loveCell.position)}宫${loveCell.bamen}门主${this.getGateMeaning(loveCell.bamen)}，感情运势较好。`;
        }
      } else if (questionType === 'money') {
        const moneyCell = grid.find(cell => cell.bamen === '生' || cell.bamen === '开');
        if (moneyCell) {
          specificAnalysis = `财运方面，${this.getPositionNameByPosition(moneyCell.position)}宫${moneyCell.bamen}门主${this.getGateMeaning(moneyCell.bamen)}，财运较旺。`;
        }
      } else if (questionType === 'health') {
        const healthCell = grid.find(cell => {
          const starName = cell.jiuxingTianPan || cell.jiuxing;
          return starName === '天芮' || starName === '天心';
        });
        if (healthCell) {
          const starName = healthCell.jiuxingTianPan || healthCell.jiuxing;
          specificAnalysis = `健康方面，${this.getPositionNameByPosition(healthCell.position)}宫${starName}星主${this.getStarMeaning(starName)}，需注意身体健康。`;
        }
      }
      
      if (specificAnalysis) {
        items.push({
          title: '针对性分析',
          content: specificAnalysis
        });
      }
      
      // 5. 综合建议
      const summary = this.generateSummary(grid, questionType);
      
      this.analysisResult = {
        items: items,
        summary: summary
      };
    },
    getPositionNameByPosition(position) {
      const names = {
        1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中',
        6: '乾', 7: '兑', 8: '艮', 9: '离'
      };
      return names[position] || '';
    },
    getStarMeaning(star) {
      const meanings = {
        '天蓬': '主破败、盗贼',
        '天芮': '主疾病、学习',
        '天冲': '主冲动、行动',
        '天辅': '主教育、辅助',
        '天禽': '主中正、平衡',
        '天心': '主医药、思考',
        '天柱': '主破坏、口舌',
        '天任': '主诚信、稳重',
        '天英': '主急躁、光明'
      };
      return meanings[star] || '';
    },
    getGateMeaning(gate) {
      const meanings = {
        '休': '休息、休养',
        '生': '生长、生机',
        '伤': '伤害、损失',
        '杜': '阻塞、隐藏',
        '景': '美景、文书',
        '死': '死亡、终结',
        '惊': '惊恐、变动',
        '开': '开放、通达'
      };
      return meanings[gate] || '';
    },
    getQuestionType(question) {
      const q = question.toLowerCase();
      if (q.includes('工作') || q.includes('事业') || q.includes('职业') || q.includes('升职')) {
        return 'work';
      } else if (q.includes('感情') || q.includes('恋爱') || q.includes('婚姻') || q.includes('爱情')) {
        return 'love';
      } else if (q.includes('财') || q.includes('钱') || q.includes('投资') || q.includes('生意')) {
        return 'money';
      } else if (q.includes('健康') || q.includes('身体') || q.includes('疾病') || q.includes('病')) {
        return 'health';
      }
      return 'general';
    },
    generateSummary(grid, questionType) {
      const goodGates = grid.filter(cell => ['开', '休', '生'].includes(cell.bamen));
      const badGates = grid.filter(cell => ['死', '惊', '伤'].includes(cell.bamen));
      
      let summary = '综合来看，';
      
      if (goodGates.length > badGates.length) {
        summary += '整体运势较好，吉门较多，有利于所求之事。';
      } else if (badGates.length > goodGates.length) {
        summary += '需要谨慎行事，凶门较多，建议等待时机或调整策略。';
      } else {
        summary += '运势平稳，吉凶参半，需要把握机会，规避风险。';
      }
      
      summary += '建议关注值符所在宫位，这是当前最重要的方位。同时注意避开凶门所在方位，选择吉门方位行动。';
      
      return summary;
    },
    // 计算三奇六仪对应宫位
    calculateSanQiLiuYiMap(juNumber, dunType) {
      // 三奇六仪顺序：戊、己、庚、辛、壬、癸、丁、丙、乙
      const liuYiSanQiOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
      const map = {};
      const isYangDun = dunType === '阳遁';
      
      // 根据局数和阴阳遁计算每个天干对应的宫位
      for (let i = 0; i < liuYiSanQiOrder.length; i++) {
        const tiangan = liuYiSanQiOrder[i];
        let gong;
        
        if (isYangDun) {
          // 阳遁：从局数对应的宫位开始，六仪三奇按照1->2->3->4->5->6->7->8->9->1的顺序顺行排布
          // 例如：阳遁1局，戊在1宫，己在2宫，...，乙在9宫
          //      阳遁2局，戊在2宫，己在3宫，...，乙在1宫
          //      阳遁3局，戊在3宫，己在4宫，...，乙在2宫
          gong = ((juNumber - 1 + i) % 9) + 1;
          if (gong === 0) gong = 9;
        } else {
          // 阴遁：从局数对应的宫位开始，六仪三奇按照1->9->8->7->6->5->4->3->2->1的顺序逆行排布
          // 例如：阴遁1局，戊在1宫，己在9宫，庚在8宫，...，乙在2宫
          //      阴遁2局，戊在2宫，己在1宫，庚在9宫，...，乙在3宫
          //      阴遁3局，戊在3宫，己在2宫，庚在1宫，...，乙在4宫
          gong = ((juNumber - 1 - i + 9) % 9) + 1;
          if (gong === 0) gong = 9;
        }
        
        map[tiangan] = gong;
      }
      
      return map;
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

.question-group {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-group label {
  font-weight: bold;
  color: #555;
}

.question-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.question-input:focus {
  outline: none;
  border-color: #409eff;
}

.btn-analyze {
  padding: 10px 20px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.btn-analyze:hover:not(:disabled) {
  background-color: #85ce61;
}

.btn-analyze:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.pan-section {
  margin-top: 30px;
}

.pan-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
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
  grid-template-columns: repeat(3, 240px);
  grid-template-rows: repeat(3, 240px);
  gap: 0;
  margin: 0 auto;
  justify-content: center;
  width: 100%;
  max-width: 720px;
}

.grid-cell {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border: 2px solid #333;
  border-radius: 0;
  padding: 8px;
  background-color: #fff;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
}

.cell-position {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex-wrap: wrap;
}

.position-number {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

.position-label {
  font-size: 10px;
  color: #909399;
  background-color: #f0f0f0;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: normal;
}

.cell-tiangan,
.cell-dizhi,
.cell-bamen,
.cell-jiuxing,
.cell-bashen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 2px 0;
  flex-wrap: wrap;
}

.cell-tiangan {
  font-size: 15px;
  font-weight: bold;
  color: #409eff;
}

.cell-tiangan-tianpan {
  font-size: 15px;
  font-weight: bold;
  color: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 2px 0;
  flex-wrap: wrap;
}

.cell-dizhi {
  font-size: 14px;
  color: #67c23a;
}

.cell-bamen {
  font-size: 12px;
  color: #e6a23c;
}

.cell-bamen-tianpan {
  font-size: 12px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 2px 0;
  flex-wrap: wrap;
}

.zhi-shi-label {
  font-size: 10px;
  color: #fff;
  background-color: #f56c6c;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
}

.cell-jiuxing {
  font-size: 13px;
  color: #909399;
}

.cell-jiuxing-dipan {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 2px 0;
  flex-wrap: wrap;
}

.cell-jiuxing-tianpan {
  font-size: 12px;
  color: #9c27b0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 2px 0;
  flex-wrap: wrap;
  font-weight: bold;
}

.cell-bashen {
  font-size: 12px;
  font-weight: bold;
  color: #f56c6c;
  margin-top: 3px;
  padding-top: 3px;
  border-top: 1px solid #ddd;
}

.section-divider {
  height: 5px;
  margin: 2px 0;
}

.info-label {
  font-size: 10px;
  color: #909399;
  background-color: #f0f0f0;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: normal;
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

.analysis-result {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
  border: 2px solid #409eff;
}

.analysis-result h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #409eff;
  font-size: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.result-content {
  color: #333;
}

.result-question {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
}

.result-question strong {
  color: #409eff;
}

.result-analysis {
  margin-bottom: 20px;
}

.result-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #409eff;
  font-size: 16px;
}

.result-item p {
  margin: 0;
  line-height: 1.6;
  color: #666;
}

.result-summary {
  background-color: #fff9e6;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #e6a23c;
}

.result-summary h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e6a23c;
  font-size: 16px;
}

.result-summary p {
  margin: 0;
  line-height: 1.6;
  color: #666;
}

.pan-rules-section {
  margin-top: 30px;
  width: 100%;
}

@media (max-width: 1200px) {
  .pan-content {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .pan-content {
    gap: 20px;
  }
  
  .pan-info {
    padding: 10px;
    gap: 15px;
  }
  
  .container {
    padding: 15px;
  }
}

.sanqi-liuyi-wrapper {
  width: 100%;
  flex-basis: 100%;
}

.sanqi-liuyi-table {
  margin-top: 10px;
}

.sanqi-liuyi-table h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.sanqi-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sanqi-table thead {
  background-color: #409eff;
  color: white;
}

.sanqi-table th {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.sanqi-table tbody tr {
  border-bottom: 1px solid #eee;
}

.sanqi-table tbody tr:last-child {
  border-bottom: none;
}

.sanqi-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.sanqi-table tbody tr:hover {
  background-color: #f0f9ff;
}

.sanqi-table td {
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: #333;
}

.sanqi-table td:first-child {
  font-weight: bold;
  color: #409eff;
}

@media (max-width: 768px) {
  .jiugong-grid {
    grid-template-columns: repeat(3, calc(33.333vw - 2px));
    grid-template-rows: repeat(3, calc(33.333vw - 2px));
    gap: 0;
    max-width: 100vw;
  }
  
  .grid-cell {
    padding: 4px;
  }
  
  .cell-position {
    font-size: 11px;
    margin-bottom: 2px;
  }
  
  .position-number {
    font-size: 13px;
  }
  
  .position-label {
    font-size: 8px;
    padding: 1px 3px;
  }
  
  .cell-tiangan,
  .cell-tiangan-tianpan {
    font-size: 13px;
  }
  
  .cell-bamen,
  .cell-bamen-tianpan,
  .cell-jiuxing,
  .cell-jiuxing-dipan,
  .cell-jiuxing-tianpan {
    font-size: 10px;
  }
  
  .cell-bashen {
    font-size: 10px;
    margin-top: 2px;
    padding-top: 2px;
  }
  
  .info-label {
    font-size: 8px;
    padding: 1px 3px;
  }
  
  .zhi-shi-label {
    font-size: 8px;
    padding: 1px 4px;
  }
  
  .section-divider {
    height: 3px;
    margin: 1px 0;
  }
  
  .sanqi-table th,
  .sanqi-table td {
    padding: 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .jiugong-grid {
    grid-template-columns: repeat(3, calc(33.333vw - 1px));
    grid-template-rows: repeat(3, calc(33.333vw - 1px));
  }
  
  .grid-cell {
    padding: 3px;
    border-width: 1px;
  }
  
  .cell-position {
    font-size: 10px;
  }
  
  .position-number {
    font-size: 12px;
  }
  
  .cell-tiangan,
  .cell-tiangan-tianpan {
    font-size: 12px;
  }
  
  .cell-bamen,
  .cell-bamen-tianpan,
  .cell-jiuxing,
  .cell-jiuxing-dipan,
  .cell-jiuxing-tianpan {
    font-size: 9px;
  }
  
  .info-label {
    font-size: 7px;
  }
}
</style>

