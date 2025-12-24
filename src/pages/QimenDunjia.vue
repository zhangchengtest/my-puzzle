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

        <div class="pan-content">
          <div class="pan-left">
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
                  </div>
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

          <div class="pan-right">
            <div class="rules">
              <h3>排盘规则</h3>
              <div class="rule-section">
                <h4>一、九宫格布局（洛书顺序）</h4>
                <div class="rule-content">
                  <p>九宫格按洛书数字排列：</p>
                  <div class="rule-grid">
                    <div>4 巽</div>
                    <div>9 离</div>
                    <div>2 坤</div>
                    <div>3 震</div>
                    <div>5 中</div>
                    <div>7 兑</div>
                    <div>8 艮</div>
                    <div>1 坎</div>
                    <div>6 乾</div>
                  </div>
                </div>
              </div>

              <div class="rule-section">
                <h4>二、局数计算</h4>
                <div class="rule-content">
                  <p>根据节气确定阳遁或阴遁，再根据日干支计算局数：</p>
                  <ul>
                    <li>冬至后到夏至前为阳遁</li>
                    <li>夏至后到冬至前为阴遁</li>
                    <li>局数范围：1-9局</li>
                  </ul>
                </div>
              </div>

              <div class="rule-section">
                <h4>三、天干地支排布规则</h4>
                <div class="rule-content">
                  <p><strong>天干：</strong>甲、乙、丙、丁、戊、己、庚、辛、壬、癸</p>
                  <p><strong>地支：</strong>子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥</p>
                  
                  <p><strong>1. 六仪三奇：</strong></p>
                  <ul>
                    <li><strong>六仪：</strong>戊、己、庚、辛、壬、癸（甲隐藏在其中）</li>
                    <li><strong>三奇：</strong>乙（日奇）、丙（月奇）、丁（星奇）</li>
                    <li>甲为值符，隐藏于六仪之中，不单独出现</li>
                  </ul>

                  <p><strong>2. 阳遁排法（冬至后到夏至前）：</strong></p>
                  <ul>
                    <li>阳遁1局：戊在坎1宫，己在坤2宫，庚在震3宫，辛在巽4宫，壬在中5宫，癸在乾6宫</li>
                    <li>阳遁2局：戊在坤2宫，己在震3宫，庚在巽4宫，辛在中5宫，壬在乾6宫，癸在兑7宫</li>
                    <li>以此类推，每局六仪顺行一位</li>
                    <li>三奇乙、丙、丁按照固定顺序排布</li>
                  </ul>

                  <p><strong>3. 阴遁排法（夏至后到冬至前）：</strong></p>
                  <ul>
                    <li>阴遁1局：戊在坎1宫，己在离9宫，庚在艮8宫，辛在兑7宫，壬在乾6宫，癸在中5宫</li>
                    <li>阴遁2局：戊在坤2宫，己在坎1宫，庚在离9宫，辛在艮8宫，壬在兑7宫，癸在乾6宫</li>
                    <li>以此类推，每局六仪逆行一位</li>
                    <li>三奇乙、丙、丁按照固定顺序排布</li>
                  </ul>

                  <p><strong>4. 地支排布：</strong></p>
                  <ul>
                    <li>地支按照时辰确定起始位置</li>
                    <li>子时从坎1宫开始，丑时从艮8宫开始，寅时从震3宫开始</li>
                    <li>卯时从巽4宫开始，辰时从中5宫开始，巳时从乾6宫开始</li>
                    <li>午时从兑7宫开始，未时从坤2宫开始，申时从离9宫开始</li>
                    <li>酉时从坎1宫开始，戌时从艮8宫开始，亥时从震3宫开始</li>
                    <li>然后按照九宫顺序顺行排布十二地支</li>
                  </ul>

                  <p><strong>5. 值符值使：</strong></p>
                  <ul>
                    <li>值符：根据时辰确定，是当值的天干（六仪之一）</li>
                    <li>值使：根据时辰确定，是当值的八门</li>
                    <li>值符和值使都跟随时辰转动</li>
                  </ul>

                  <p><strong>6. 排盘步骤：</strong></p>
                  <ol>
                    <li>确定阳遁或阴遁（根据节气）</li>
                    <li>确定局数（根据日干支）</li>
                    <li>排布六仪三奇（根据局数和阴阳遁）</li>
                    <li>排布地支（根据时辰）</li>
                    <li>确定值符值使（根据时辰）</li>
                    <li>排布八门九星八神</li>
                  </ol>
                </div>
              </div>

              <div class="rule-section">
                <h4>四、八门</h4>
                <div class="rule-content">
                  <p>八门：休、生、伤、杜、景、死、惊、开</p>
                  <p>八门按照固定的顺序排布在九宫格中，值使门根据时辰确定。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>五、九星</h4>
                <div class="rule-content">
                  <p>九星：天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英</p>
                  <p>九星按照固定的顺序排布，值符星根据时辰确定。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>六、八神</h4>
                <div class="rule-content">
                  <p>八神：值符、腾蛇、太阴、六合、白虎、玄武、九地、九天</p>
                  <p>八神按照时辰和值符位置排布，值符在值符星所在宫位。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>七、时辰对应</h4>
                <div class="rule-content">
                  <p>子时(23-1)、丑时(1-3)、寅时(3-5)、卯时(5-7)、</p>
                  <p>辰时(7-9)、巳时(9-11)、午时(11-13)、未时(13-15)、</p>
                  <p>申时(15-17)、酉时(17-19)、戌时(19-21)、亥时(21-23)</p>
                </div>
              </div>
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
    },
    analyzePan() {
      if (!this.panData || !this.question) return;
      
      const grid = this.panData.grid;
      const items = [];
      
      // 1. 分析值符值使
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      if (zhiFuCell) {
        items.push({
          title: '值符分析',
          content: `值符在${this.getPositionNameByPosition(zhiFuCell.position)}宫，${zhiFuCell.jiuxing}星当值，主${this.getStarMeaning(zhiFuCell.jiuxing)}。`
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
        if (cell.jiuxing) {
          starAnalysis.push(`${this.getPositionNameByPosition(cell.position)}宫${cell.jiuxing}星，${this.getStarMeaning(cell.jiuxing)}`);
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
        const healthCell = grid.find(cell => cell.jiuxing === '天芮' || cell.jiuxing === '天心');
        if (healthCell) {
          specificAnalysis = `健康方面，${this.getPositionNameByPosition(healthCell.position)}宫${healthCell.jiuxing}星主${this.getStarMeaning(healthCell.jiuxing)}，需注意身体健康。`;
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
  gap: 30px;
  align-items: flex-start;
}

.pan-left {
  flex: 1;
  min-width: 0;
}

.pan-right {
  width: 350px;
  flex-shrink: 0;
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
  max-width: 600px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.position-number {
  color: #409eff;
  font-weight: bold;
  font-size: 18px;
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

.rules {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.rules h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.rule-section {
  margin-bottom: 20px;
}

.rule-section h4 {
  color: #409eff;
  font-size: 16px;
  margin-bottom: 10px;
  margin-top: 0;
}

.rule-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.rule-content p {
  margin: 8px 0;
}

.rule-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.rule-content li {
  margin: 5px 0;
}

.rule-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0;
  text-align: center;
}

.rule-grid div {
  background-color: #fff;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .pan-content {
    flex-direction: column;
  }
  
  .pan-right {
    width: 100%;
  }
  
  .rules {
    position: static;
    max-height: none;
  }
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

