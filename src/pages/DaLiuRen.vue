<template>
  <div class="daliuren">
    <div class="container">
      <h1 class="title">大六壬排盘</h1>
      
      <div class="input-section">
        <div class="datetime-group">
          <label>选择时间：</label>
          <input type="datetime-local" v-model="selectedDateTime" @change="calculatePan" />
          <button @click="useCurrentTime" class="btn-current">当前时间</button>
        </div>
      </div>

      <div class="pan-section" v-if="panData">
        <div class="pan-content">
          <!-- 四课显示 -->
          <div class="sike-section">
            <h3>四课</h3>
            <div class="sike-grid">
              <div class="sike-item" v-for="(ke, index) in panData.sike" :key="index">
                <div class="sike-label">第{{ index + 1 }}课</div>
                <div class="sike-content">
                  <template v-if="index === 0">
                    <!-- 第一课：天干 + 地支 -->
                    <span class="dizhi">{{ ke.dizhi }}</span>
                    <span class="tiangan">{{ ke.tiangan }}</span>
                  </template>
                  <template v-else>
                    <!-- 其他课：两个地支 -->
                    <span class="dizhi">{{ ke.dizhiUp }}</span>
                    <span class="dizhi">{{ ke.dizhiDown }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 三传显示 -->
          <div class="sanchuan-section">
            <h3>三传</h3>
            <div class="sanchuan-grid">
              <div class="sanchuan-item">
                <div class="sanchuan-label">初传</div>
                <div class="sanchuan-content">
                  <span class="tiangan">{{ panData.sanchuan.chuan.tiangan }}</span>
                  <span class="dizhi">{{ panData.sanchuan.chuan.dizhi }}</span>
                  <span class="shenjiang" v-if="panData.sanchuan.chuan.shenjiang">{{ panData.sanchuan.chuan.shenjiang.name || panData.sanchuan.chuan.shenjiang }}</span>
                </div>
              </div>
              <div class="sanchuan-item">
                <div class="sanchuan-label">中传</div>
                <div class="sanchuan-content">
                  <span class="tiangan" v-if="panData.sanchuan.zhong.tiangan">{{ panData.sanchuan.zhong.tiangan }}</span>
                  <span class="dizhi">{{ panData.sanchuan.zhong.dizhi }}</span>
                  <span class="shenjiang" v-if="panData.sanchuan.zhong.shenjiang">{{ panData.sanchuan.zhong.shenjiang.name || panData.sanchuan.zhong.shenjiang }}</span>
                </div>
              </div>
              <div class="sanchuan-item">
                <div class="sanchuan-label">末传</div>
                <div class="sanchuan-content">
                  <span class="tiangan" v-if="panData.sanchuan.mo.tiangan">{{ panData.sanchuan.mo.tiangan }}</span>
                  <span class="dizhi">{{ panData.sanchuan.mo.dizhi }}</span>
                  <span class="shenjiang" v-if="panData.sanchuan.mo.shenjiang">{{ panData.sanchuan.mo.shenjiang.name || panData.sanchuan.mo.shenjiang }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 天盘地盘合并显示 -->
          <div class="pan-section">
            <h3>天盘地盘</h3>
            <div class="pan-grid-container">
              <div class="pan-grid-16">
                <div 
                  v-for="(cell, index) in panData.combinedGrid" 
                  :key="index"
                  class="pan-grid-cell"
                  :class="{ 
                    'has-content': cell !== null,
                    'empty-cell': cell === null
                  }"
                >
                  <div class="cell-number">{{ index + 1 }}</div>
                  <template v-if="cell">
                    <!-- 天盘信息（上方） -->
                    <div class="tianpan-part">
                      <div class="dizhi-label tianpan-dizhi">{{ cell.tianpan?.tianpanDizhi || cell.tianpan?.dizhi }}</div>
                      <div class="yuejiang-info" v-if="cell.tianpan?.yuejiang">
                        <div class="info-label">月将</div>
                        <div class="yuejiang-name">
                          {{ cell.tianpan.yuejiang }}
                          <span v-if="cell.tianpan.yuejiangDizhi" class="yuejiang-dizhi">（{{ cell.tianpan.yuejiangDizhi }}时）</span>
                        </div>
                      </div>
                      <div class="shenjiang-info" v-if="cell.tianpan?.shenjiang">
                        <div class="info-label">神将</div>
                        <div class="shenjiang-label" :class="{ 'guiren': (cell.tianpan.shenjiang.name || cell.tianpan.shenjiang) === '贵人' }">
                          {{ cell.tianpan.shenjiang.name || cell.tianpan.shenjiang }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- 分隔线 -->
                    <div class="divider"></div>
                    
                    <!-- 地盘信息（下方） -->
                    <div class="dipan-part">
                      <div class="dizhi-label dipan-dizhi">{{ cell.dipan?.dizhi }}</div>
                    </div>
                  </template>
                  <div v-else class="empty-label">空</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 信息显示 -->
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
            <span class="label">日干支：</span>
            <span>{{ panData.dayGanZhi }}</span>
          </div>
          <div class="info-item">
            <span class="label">时干支：</span>
            <span>{{ panData.timeGanZhi }}</span>
          </div>
          <div class="info-item">
            <span class="label">节气：</span>
            <span>{{ panData.solarTerm }}</span>
          </div>
          <div class="info-item">
            <span class="label">月将：</span>
            <span>{{ panData.yuejiang }}<span v-if="panData.yuejiangDizhi">（{{ panData.yuejiangDizhi }}时）</span></span>
          </div>
          <div class="info-item">
            <span class="label">占时：</span>
            <span>{{ panData.timeBranch }}</span>
          </div>
        </div>

        <!-- 贵人对应关系表格 -->
        <div class="guiren-table-section">
          <h3>贵人对应关系</h3>
          <table class="guiren-table">
            <thead>
              <tr>
                <th>用神天干</th>
                <th>甲戊庚</th>
                <th>乙己</th>
                <th>丙丁</th>
                <th>壬癸</th>
                <th>辛</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="guiren-label">阳贵人</td>
                <td>丑（丑时）</td>
                <td>子（子时）</td>
                <td>亥（亥时）</td>
                <td>巳（巳时）</td>
                <td>午（午时）</td>
              </tr>
              <tr>
                <td class="guiren-label">阴贵人</td>
                <td>未（未时）</td>
                <td>申（申时）</td>
                <td>酉（酉时）</td>
                <td>卯（卯时）</td>
                <td>寅（寅时）</td>
              </tr>
            </tbody>
          </table>
          <div class="guiren-note" v-if="panData">
            <p>当前日干：<strong>{{ panData.dayGan }}</strong> | 
            当前时辰：<strong>{{ panData.timeBranch }}</strong> | 
            昼夜：<strong>{{ panData.isDay ? '白天（阳贵人）' : '黑夜（阴贵人）' }}</strong> | 
            贵人天盘地支：<strong>{{ panData.guirenDizhi }}</strong> | 
            贵人地盘地支：<strong v-if="panData.guirenDipanDizhi">{{ panData.guirenDipanDizhi }}</strong><strong v-else>未找到</strong> | 
            神将排列：<strong>{{ panData.shenjiangDirection }}</strong></p>
          </div>
          
          <!-- 十干寄宫口诀 -->
          <div class="jigong-koujue">
            <h4>十干寄宫口诀</h4>
            <p class="koujue-text">甲课寅兮乙课辰，丙戊课巳不需论；</p>
            <p class="koujue-text">丁己课未庚申上，辛戌壬亥是其真；</p>
            <p class="koujue-text">癸课原来丑宫坐，分明不用四正神</p>
            <div class="jigong-table">
              <table class="jigong-table-inner">
                <thead>
                  <tr>
                    <th>天干</th>
                    <th>甲</th>
                    <th>乙</th>
                    <th>丙</th>
                    <th>丁</th>
                    <th>戊</th>
                    <th>己</th>
                    <th>庚</th>
                    <th>辛</th>
                    <th>壬</th>
                    <th>癸</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="jigong-label">寄宫</td>
                    <td>寅</td>
                    <td>辰</td>
                    <td>巳</td>
                    <td>未</td>
                    <td>巳</td>
                    <td>未</td>
                    <td>申</td>
                    <td>戌</td>
                    <td>亥</td>
                    <td>丑</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentSolarTermWithDate, getCurrentSolarTerm } from '@/utils/solarTerm';

export default {
  name: 'DaLiuRen',
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
      const minute = date.getMinutes();
      
      // 计算农历
      const lunarDate = this.getLunarDate(year, month, day);
      
      // 计算日干支
      const dayGanZhi = this.getDayGanZhi(year, month, day, hour, minute);
      
      // 计算时干支
      const timeGanZhi = this.getTimeGanZhi(year, month, day, hour);
      
      // 计算时辰
      const timeBranch = this.getTimeBranch(hour);
      
      // 计算当前节气
      const currentSolarTerm = getCurrentSolarTermWithDate(year, month, day, hour, minute);
      const solarTermName = currentSolarTerm.name;
      
      // 根据节气计算月将
      const yuejiang = this.getYuejiangBySolarTerm(solarTermName);
      
      // 获取月将对应的时辰
      const yuejiangDizhi = this.getYuejiangDizhi(yuejiang);
      
      // 计算贵人和昼夜信息（先计算，用于后续计算）
      const dayGan = dayGanZhi[0];
      const timeZhi = timeGanZhi[1];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const timeZhiIndex = zhi.indexOf(timeZhi);
      const isDay = timeZhiIndex >= 0 && timeZhiIndex < 6; // 子到巳为昼，午到亥为夜
      
      // 根据日干和昼夜确定贵人位置
      let guirenDizhi;
      if (dayGan === '甲' || dayGan === '戊' || dayGan === '庚') {
        guirenDizhi = isDay ? '丑' : '未'; // 阳贵人丑，阴贵人未
      } else if (dayGan === '乙' || dayGan === '己') {
        guirenDizhi = isDay ? '子' : '申'; // 阳贵人子，阴贵人申
      } else if (dayGan === '丙' || dayGan === '丁') {
        guirenDizhi = isDay ? '亥' : '酉'; // 阳贵人亥，阴贵人酉
      } else if (dayGan === '壬' || dayGan === '癸') {
        guirenDizhi = isDay ? '巳' : '卯'; // 阳贵人巳，阴贵人卯
      } else { // 辛
        guirenDizhi = isDay ? '午' : '寅'; // 阳贵人午，阴贵人寅
      }
      
      // 先临时计算天盘，用于查找贵人位置（使用默认isShun=true）
      const { dipan: tempDipan, tianpan: tempTianpan } = this.calculateDipanTianpan(yuejiang, timeGanZhi, dayGanZhi, true);
      
      // 查找贵人所在的地盘地支位置
      let guirenDipanDizhi = null;
      for (let i = 0; i < tempTianpan.length; i++) {
        const tianpanItem = tempTianpan[i];
        if (tianpanItem && tianpanItem.tianpanDizhi === guirenDizhi) {
          guirenDipanDizhi = tianpanItem.dizhi; // 地盘的地支
          break;
        }
      }
      
      // 计算神将的顺逆方向（根据贵人所落的地盘地支判断）
      // 顺时针排：亥子丑寅卯辰
      // 逆时针排：巳午未申酉戌
      const shunDizhi = ['亥', '子', '丑', '寅', '卯', '辰'];
      const shenjiangDirection = guirenDipanDizhi ? 
        (shunDizhi.includes(guirenDipanDizhi) ? '顺时针' : '逆时针') : 
        '未知';
      const isShun = guirenDipanDizhi ? shunDizhi.includes(guirenDipanDizhi) : true;
      
      // 先计算地盘天盘（传入isShun），因为四课需要天盘数据
      const { dipan, tianpan } = this.calculateDipanTianpan(yuejiang, timeGanZhi, dayGanZhi, isShun);
      
      // 计算四课（需要天盘数据）
      const sike = this.calculateSike(dayGanZhi, tianpan);
      
      // 计算三传（传入isShun）
      const sanchuan = this.calculateSanchuan(sike, timeGanZhi, dayGanZhi, isShun);
      
      // 转换为16宫格布局（4x4，中间4个为空）
      const dipanGrid = this.convertTo16Grid(dipan);
      const tianpanGrid = this.convertTo16Grid(tianpan);
      
      // 合并天盘和地盘数据
      const combinedGrid = dipanGrid.map((dipanCell, index) => {
        const tianpanCell = tianpanGrid[index];
        if (dipanCell === null && tianpanCell === null) {
          return null;
        }
        return {
          dipan: dipanCell,
          tianpan: tianpanCell
        };
      });
      
      this.panData = {
        solarDate: `${year}年${month}月${day}日 ${hour}时${minute}分`,
        lunarDate: lunarDate,
        dayGanZhi: dayGanZhi,
        dayGan: dayGan,
        timeGanZhi: timeGanZhi,
        timeBranch: timeBranch,
        solarTerm: solarTermName,
        yuejiang: yuejiang,
        yuejiangDizhi: yuejiangDizhi,
        isDay: isDay,
        guirenDizhi: guirenDizhi,
        guirenDipanDizhi: guirenDipanDizhi,
        shenjiangDirection: shenjiangDirection,
        sike: sike,
        sanchuan: sanchuan,
        dipan: dipan,
        tianpan: tianpan,
        dipanGrid: dipanGrid,
        tianpanGrid: tianpanGrid,
        combinedGrid: combinedGrid
      };
    },
    // 计算农历（简化版）
    getLunarDate(year, month, day) {
      // 这里使用简化的农历转换，实际应该使用专业的农历库
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
      
      // 简化处理：直接显示公历月份
      const ganZhiYear = this.getGanZhiYear(year);
      return `${ganZhiYear}年${lunarMonths[month - 1]}月${day}日`;
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
    // 计算日干支
    getDayGanZhi(year, month, day, hour = 0, minute = 0) {
      // 子初换日：23点以后算第二天
      let adjustedYear = year;
      let adjustedMonth = month;
      let adjustedDay = day;
      
      if (hour >= 23) {
        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + 1);
        adjustedYear = date.getFullYear();
        adjustedMonth = date.getMonth() + 1;
        adjustedDay = date.getDate();
      }
      
      // 计算儒略日数
      const jdn = this.toJulianDayNumber(adjustedYear, adjustedMonth, adjustedDay);
      
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 计算干支索引
      const ganIndex = ((jdn + 9) % 10 + 10) % 10;
      const zhiIndex = ((jdn + 1) % 12 + 12) % 12;
      
      return gan[ganIndex] + zhi[zhiIndex];
    },
    toJulianDayNumber(year, month, day) {
      const a = Math.floor((14 - month) / 12);
      const y = year + 4800 - a;
      const m = month + 12 * a - 3;
      
      return day
        + Math.floor((153 * m + 2) / 5)
        + 365 * y
        + Math.floor(y / 4)
        - Math.floor(y / 100)
        + Math.floor(y / 400)
        - 32045;
    },
    // 计算时干支
    getTimeGanZhi(year, month, day, hour) {
      const dayGanZhi = this.getDayGanZhi(year, month, day, hour, 0);
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      const dayGanIndex = gan.indexOf(dayGanZhi[0]);
      
      // 计算时辰的地支索引
      const timeZhiIndex = Math.floor((hour + 1) / 2) % 12;
      
      // 时干计算公式
      let ziShiGanIndex;
      if (dayGanIndex === 0 || dayGanIndex === 5) {
        ziShiGanIndex = 0; // 甲
      } else if (dayGanIndex === 1 || dayGanIndex === 6) {
        ziShiGanIndex = 2; // 丙
      } else if (dayGanIndex === 2 || dayGanIndex === 7) {
        ziShiGanIndex = 4; // 戊
      } else if (dayGanIndex === 3 || dayGanIndex === 8) {
        ziShiGanIndex = 6; // 庚
      } else {
        ziShiGanIndex = 8; // 壬
      }
      
      const timeGanIndex = (ziShiGanIndex + timeZhiIndex) % 10;
      
      return gan[timeGanIndex] + zhi[timeZhiIndex];
    },
    // 计算时辰
    getTimeBranch(hour) {
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const index = Math.floor((hour + 1) / 2) % 12;
      return branches[index] + '时';
    },
    // 根据节气计算月将
    getYuejiangBySolarTerm(solarTermName) {
      // 月将对应关系（根据节气，节气后使用对应月将）
      // 雨水后：亥将（登明）
      // 春分后：戌将（河魁）
      // 谷雨后：酉将（从魁）
      // 小满后：申将（传送）
      // 夏至后：未将（小吉）
      // 大暑后：午将（胜光）
      // 处暑后：巳将（太乙）
      // 秋分后：辰将（天罡）
      // 霜降后：卯将（太冲）
      // 小雪后：寅将（功曹）
      // 冬至后：丑将（大吉）
      // 大寒后：子将（神后）
      
      const solarTermToYuejiang = {
        '雨水': '登明',   // 亥
        '春分': '河魁',   // 戌
        '谷雨': '从魁',   // 酉
        '小满': '传送',   // 申
        '夏至': '小吉',   // 未
        '大暑': '胜光',   // 午
        '处暑': '太乙',   // 巳
        '秋分': '天罡',   // 辰
        '霜降': '太冲',   // 卯
        '小雪': '功曹',   // 寅
        '冬至': '大吉',   // 丑
        '大寒': '神后'    // 子
      };
      
      // 如果当前节气不在映射表中，查找最近的已过去的节气
      if (!solarTermToYuejiang[solarTermName]) {
        // 节气顺序
        const solarTerms = [
          '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
          '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
          '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
          '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
        ];
        
        const currentIndex = solarTerms.indexOf(solarTermName);
        if (currentIndex === -1) {
          // 如果找不到，默认使用大寒对应的河魁
          return '河魁';
        }
        
        // 向前查找最近的月将对应节气
        for (let i = currentIndex; i >= 0; i--) {
          if (solarTermToYuejiang[solarTerms[i]]) {
            return solarTermToYuejiang[solarTerms[i]];
          }
        }
        
        // 如果向前找不到，从后往前找（处理跨年）
        for (let i = solarTerms.length - 1; i > currentIndex; i--) {
          if (solarTermToYuejiang[solarTerms[i]]) {
            return solarTermToYuejiang[solarTerms[i]];
          }
        }
        
        // 默认返回河魁
        return '河魁';
      }
      
      return solarTermToYuejiang[solarTermName];
    },
    // 获取月将对应的时辰（地支）
    getYuejiangDizhi(yuejiang) {
      // 月将名称到地支的映射
      const yuejiangToDizhi = {
        '神后': '子', '大吉': '丑', '功曹': '寅', '太冲': '卯',
        '天罡': '辰', '太乙': '巳', '胜光': '午', '小吉': '未',
        '传送': '申', '从魁': '酉', '河魁': '戌', '登明': '亥'
      };
      return yuejiangToDizhi[yuejiang] || '';
    },
    // 计算四课
    calculateSike(dayGanZhi, tianpan) {
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      const dayGan = dayGanZhi[0];
      const dayZhi = dayGanZhi[1];
      
      // 地支藏干表
      const dizhiCanggan = {
        '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
        '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'],
        '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
        '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
      };
      
      // 十干寄宫口诀：
      // 甲课寅兮乙课辰，丙戊课巳不需论；
      // 丁己课未庚申上，辛戌壬亥是其真；
      // 癸课原来丑宫坐，分明不用四正神
      const ganJigong = {
        '甲': '寅', '乙': '辰', '丙': '巳', '丁': '未', '戊': '巳',
        '己': '未', '庚': '申', '辛': '戌', '壬': '亥', '癸': '丑'
      };
      
      // 第一课：日干上神
      // 日干寄宫的地支
      const dayGanJigong = ganJigong[dayGan] || '寅';
      // 在天盘中找到日干寄宫对应的天盘地支
      let firstKeDizhi = dayGanJigong; // 默认值
      if (tianpan) {
        const jigongIndex = zhi.indexOf(dayGanJigong);
        if (jigongIndex >= 0 && tianpan[jigongIndex]) {
          firstKeDizhi = tianpan[jigongIndex].tianpanDizhi; // 天盘上该位置的地支
        }
      }
      const firstKeTiangan = dayGan;
      
      // 第二课：第一课上神
      // 根据第一课取得的地支，找出在地盘上的位置
      // 根据地盘上的位置找出对应的天盘上的字，写在第一课地支的上面，即为第二课
      let secondKeDizhi = firstKeDizhi; // 默认值
      if (tianpan) {
        // 第一课的地支在地盘上的位置（地盘是固定的：子、丑、寅...亥）
        const firstKeDizhiIndex = zhi.indexOf(firstKeDizhi);
        if (firstKeDizhiIndex >= 0 && tianpan[firstKeDizhiIndex]) {
          // 在该地盘位置上，对应的天盘地支
          secondKeDizhi = tianpan[firstKeDizhiIndex].tianpanDizhi;
        }
      }
      // 第二课的天干：使用第一课的天干
      const secondKeTiangan = firstKeTiangan;
      
      // 第三课：第一课上神
      // 根据第一课取得的地支，找出在地盘上的位置
      // 根据地盘上的位置找出对应的天盘上的字
      let thirdKeDizhi = firstKeDizhi; // 默认值
      if (tianpan) {
        // 第一课的地支在地盘上的位置（地盘是固定的：子、丑、寅...亥）
        const firstKeDizhiIndex = zhi.indexOf(firstKeDizhi);
        if (firstKeDizhiIndex >= 0 && tianpan[firstKeDizhiIndex]) {
          // 在该地盘位置上，对应的天盘地支
          thirdKeDizhi = tianpan[firstKeDizhiIndex].tianpanDizhi;
        }
      }
      const thirdKeTiangan = firstKeTiangan;
      
      // 第四课：第二课上神
      // 根据第二课取得的地支，找出在地盘上的位置
      // 根据地盘上的位置找出对应的天盘上的字
      let fourthKeDizhi = secondKeDizhi; // 默认值
      if (tianpan) {
        // 第二课的地支在地盘上的位置
        const secondKeDizhiIndex = zhi.indexOf(secondKeDizhi);
        if (secondKeDizhiIndex >= 0 && tianpan[secondKeDizhiIndex]) {
          // 在该地盘位置上，对应的天盘地支
          fourthKeDizhi = tianpan[secondKeDizhiIndex].tianpanDizhi;
        }
      }
      const fourthKeTiangan = secondKeTiangan;
      
      return [
        { tiangan: firstKeTiangan, dizhi: firstKeDizhi }, // 第一课：天干 + 地支
        { dizhiUp: secondKeDizhi, dizhiDown: firstKeDizhi },   // 第二课：两个地支
        { dizhiUp: secondKeDizhi, dizhiDown: thirdKeDizhi },  // 第三课：两个地支
        { dizhiUp: thirdKeDizhi, dizhiDown: fourthKeDizhi }    // 第四课：两个地支
      ];
    },
    // 计算三传
    calculateSanchuan(sike, timeGanZhi, dayGanZhi, isShun = true) {
      // 大六壬三传计算：根据四课的克应关系
      // 简化处理：使用贼克法（第一课克第二课，或第二课克第一课）
      
      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 五行相克关系
      const wuxingKe = {
        '甲': '土', '乙': '土', '丙': '金', '丁': '金', '戊': '水',
        '己': '水', '庚': '木', '辛': '木', '壬': '火', '癸': '火'
      };
      
      const wuxing = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
        '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
        '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
        '戌': '土', '亥': '水'
      };
      
      // 简化处理：使用第一课和第二课的地支作为初传和中传
      // 实际应该根据克应关系确定
      const chuanDizhi = sike[0].dizhi; // 初传：第一课的地支
      const zhongDizhi = sike[1].dizhiDown; // 中传：第二课的下地支
      // 末传：根据中传确定（简化处理）
      const zhiIndex = zhi.indexOf(zhongDizhi);
      const moDizhi = zhi[(zhiIndex + 1) % 12]; // 末传
      
      const chuan = {
        tiangan: sike[0].tiangan,
        dizhi: chuanDizhi,
        shenjiang: this.getShenjiang(chuanDizhi, timeGanZhi, dayGanZhi, null, isShun)
      };
      
      const zhong = {
        tiangan: null, // 中传没有天干
        dizhi: zhongDizhi,
        shenjiang: this.getShenjiang(zhongDizhi, timeGanZhi, dayGanZhi, null, isShun)
      };
      
      const mo = {
        tiangan: null, // 末传没有天干
        dizhi: moDizhi,
        shenjiang: this.getShenjiang(moDizhi, timeGanZhi, dayGanZhi, null, isShun)
      };
      
      return { chuan, zhong, mo };
    },
    // 计算十二神将
    getShenjiang(dizhi, timeGanZhi, dayGanZhi, dipanDizhi = null, isShun = true) {
      // 十二神将顺序：贵人、螣蛇、朱雀、六合、勾陈、青龙、
      //               天空、白虎、太常、玄武、太阴、天后
      const shenjiangList = ['贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', 
                              '天空', '白虎', '太常', '玄武', '太阴', '天后'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 贵人的确定：根据日干和昼夜
      // 甲戊庚：阳贵人丑，阴贵人未
      // 乙己：阳贵人子，阴贵人申
      // 丙丁：阳贵人亥，阴贵人酉
      // 壬癸：阳贵人巳，阴贵人卯
      // 辛：阳贵人午，阴贵人寅
      
      const dayGan = dayGanZhi[0];
      const timeZhi = timeGanZhi[1];
      
      // 判断昼夜：子时至巳时为昼，午时至亥时为夜
      const timeZhiIndex = zhi.indexOf(timeZhi);
      const isDay = timeZhiIndex >= 0 && timeZhiIndex < 6; // 子到巳为昼，午到亥为夜
      
      let guirenDizhi;
      if (dayGan === '甲' || dayGan === '戊' || dayGan === '庚') {
        guirenDizhi = isDay ? '丑' : '未'; // 白天用阳贵人丑，黑夜用阴贵人未
      } else if (dayGan === '乙' || dayGan === '己') {
        guirenDizhi = isDay ? '子' : '申'; // 白天用阳贵人子，黑夜用阴贵人申
      } else if (dayGan === '丙' || dayGan === '丁') {
        guirenDizhi = isDay ? '亥' : '酉'; // 白天用阳贵人亥，黑夜用阴贵人酉
      } else if (dayGan === '壬' || dayGan === '癸') {
        guirenDizhi = isDay ? '巳' : '卯'; // 白天用阳贵人巳，黑夜用阴贵人卯
      } else { // 辛
        guirenDizhi = isDay ? '午' : '寅'; // 白天用阳贵人午，黑夜用阴贵人寅
      }
      
      // 计算当前地支相对于贵人的位置
      const guirenIndex = zhi.indexOf(guirenDizhi);
      const dizhiIndex = zhi.indexOf(dizhi);
      
      let offset;
      if (isShun) {
        offset = (dizhiIndex - guirenIndex + 12) % 12;
      } else {
        offset = (guirenIndex - dizhiIndex + 12) % 12;
      }
      
      return {
        name: shenjiangList[offset],
        isShun: isShun,
        direction: isShun ? '顺时针' : '逆时针'
      };
    },
    // 计算地盘天盘
    calculateDipanTianpan(yuejiang, timeGanZhi, dayGanZhi, isShun = true) {
      // 地盘固定顺序：子（北）、丑、寅、卯（东）、辰、巳、午（南）、未、申、酉（西）、戌、亥
      // 按顺时针排列，子位为正北方
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 方位标签映射
      const fangweiMap = {
        '子': '北', '丑': '东北偏北', '寅': '东北偏东', '卯': '东',
        '辰': '东南偏东', '巳': '东南偏南', '午': '南', '未': '西南偏南',
        '申': '西南偏西', '酉': '西', '戌': '西北偏西', '亥': '西北偏北'
      };
      
      // 月将名称到地支的映射
      const yuejiangToDizhi = {
        '神后': '子', '大吉': '丑', '功曹': '寅', '太冲': '卯',
        '天罡': '辰', '太乙': '巳', '胜光': '午', '小吉': '未',
        '传送': '申', '从魁': '酉', '河魁': '戌', '登明': '亥'
      };
      
      const yuejiangDizhi = yuejiangToDizhi[yuejiang] || '子';
      
      // 计算天盘：月将加在时支上
      const timeZhi = timeGanZhi[1];
      const timeZhiIndex = zhi.indexOf(timeZhi);
      const yuejiangIndex = zhi.indexOf(yuejiangDizhi);
      
      // 地盘：固定的十二地支位置，按方位顺序排列，每个位置有神将
      const dipan = zhi.map((dz) => {
        const shenjiang = this.getShenjiang(dz, timeGanZhi, dayGanZhi, null, isShun);
        return {
          dizhi: dz,
          fangwei: fangweiMap[dz],
          shenjiang: shenjiang
        };
      });
      
      // 天盘：月将加在时支上，顺行十二辰
      // 规则：月将加在时支位置，然后按顺时针顺序排列
      // 例如：月将亥加于子时，则天盘子位为亥，丑位为子，寅位为丑，依此类推
      const tianpan = zhi.map((dz, index) => {
        // 计算天盘在该位置应该显示的地支
        // 时支在地盘的位置是 timeZhiIndex
        // 月将的地支索引是 yuejiangIndex
        // 天盘在时支位置显示月将，然后顺时针顺延
        // 天盘[i] = 月将地支 + (地盘位置i - 时支位置) mod 12
        const offset = (index - timeZhiIndex + 12) % 12;
        const tianpanDizhiIndex = (yuejiangIndex + offset) % 12;
        const tianpanDizhi = zhi[tianpanDizhiIndex];
        
        // 判断该位置是否有月将（天盘显示的地支等于月将的地支）
        let yuejiangName = null;
        let yuejiangDizhiName = null;
        if (tianpanDizhi === yuejiangDizhi) {
          yuejiangName = yuejiang;
          yuejiangDizhiName = yuejiangDizhi; // 月将对应的时辰（地支）
        }
        
        // 计算神将（根据天盘的地支位置，使用统一的isShun参数）
        const shenjiang = this.getShenjiang(tianpanDizhi, timeGanZhi, dayGanZhi, dz, isShun);
        
        return {
          dizhi: dz, // 地盘的地支（固定位置）
          tianpanDizhi: tianpanDizhi, // 天盘显示的地支（月将加时顺行）
          fangwei: fangweiMap[dz],
          yuejiang: yuejiangName,
          yuejiangDizhi: yuejiangDizhiName, // 月将对应的时辰
          shenjiang: shenjiang
        };
      });
      
      return { dipan, tianpan };
    },
    // 转换为16宫格布局（4x4，中间4个为空）
    convertTo16Grid(cells) {
      // 16宫格布局，中间4个（索引5,6,9,10）为空
      // 布局顺序：子位在序数15（索引14），丑在序数14（索引13），寅在序数13（索引12），其它按顺时针顺延
      // 序数：1   2   3   4   -> 巳 午 未 申（上方-南方）
      //       5   空  空  8   -> 辰     酉
      //       9   空  空  12  -> 卯     戌
      //       13  14  15  16  -> 寅 丑 子 亥（下方-北方，子位在15）
      // 索引：0   1   2   3
      //       4   5   6   7
      //       8   9   10  11
      //       12  13  14  15
      // 
      // 顺时针顺序（从子位14开始）：子(14,序15) -> 丑(13,序14) -> 寅(12,序13) -> 卯(8,序9) -> 辰(4,序5) -> 巳(0,序1) -> 午(1,序2) -> 未(2,序3) -> 申(3,序4) -> 酉(7,序8) -> 戌(11,序12) -> 亥(15,序16)
      
      const grid = new Array(16).fill(null);
      
      // cells数组顺序：子(0)、丑(1)、寅(2)、卯(3)、辰(4)、巳(5)、午(6)、未(7)、申(8)、酉(9)、戌(10)、亥(11)
      // 定义12个地支在16宫格中的位置索引（子位在序数15即索引14，丑在序数14即索引13，寅在序数13即索引12，其它顺时针顺延）
      const positions = [
        14,  // 子(0) - 第四行第三个（序数15，正下方-北方）
        13,  // 丑(1) - 第四行第二个（序数14，子位左边）
        12,  // 寅(2) - 第四行第一个（序数13，丑位左边）
        8,   // 卯(3) - 第三行第一个（序数9，寅位上方）
        4,   // 辰(4) - 第二行第一个（序数5，卯位上方）
        0,   // 巳(5) - 第一行第一个（序数1，辰位上方，正上方-南方）
        1,   // 午(6) - 第一行第二个（序数2，巳位右边）
        2,   // 未(7) - 第一行第三个（序数3，午位右边）
        3,   // 申(8) - 第一行第四个（序数4，未位右边）
        7,   // 酉(9) - 第二行第四个（序数8，申位下方）
        11,  // 戌(10) - 第三行第四个（序数12，酉位下方）
        15   // 亥(11) - 第四行第四个（序数16，戌位下方）
      ];
      
      // 将12个地支放入对应位置
      cells.forEach((cell, index) => {
        grid[positions[index]] = cell;
      });
      
      return grid;
    }
  }
};
</script>

<style scoped>
.daliuren {
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

.pan-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.sike-section,
.sanchuan-section,
.pan-section,
.guiren-table-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin: 0;
  position: relative;
  clear: both;
}

.pan-section {
  margin-bottom: 30px;
  overflow: visible;
}

.sike-section h3,
.sanchuan-section h3,
.pan-section h3,
.guiren-table-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
  text-align: center;
}

.guiren-table-section {
  margin-top: 0;
  margin-bottom: 0;
}

.guiren-table {
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
  background-color: white;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.guiren-table th {
  background-color: #409eff;
  color: white;
  padding: 12px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.guiren-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid #e4e7ed;
  font-size: 14px;
}

.guiren-table tbody tr:nth-child(even) {
  background-color: #f5f7fa;
}

.guiren-table tbody tr:hover {
  background-color: #ecf5ff;
}

.guiren-label {
  background-color: #67c23a !important;
  color: white !important;
  font-weight: bold;
}

.guiren-note {
  margin-top: 15px;
  padding: 12px;
  background-color: #ecf5ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.guiren-note p {
  margin: 0;
  line-height: 1.6;
}

.guiren-note strong {
  color: #409eff;
  font-weight: bold;
}

.jigong-koujue {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 2px solid #e4e7ed;
}

.jigong-koujue h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  text-align: center;
  font-weight: bold;
}

.koujue-text {
  text-align: center;
  font-size: 16px;
  color: #555;
  margin: 8px 0;
  line-height: 1.8;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.jigong-table {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.jigong-table-inner {
  width: 100%;
  max-width: 900px;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.jigong-table-inner th {
  background-color: #67c23a;
  color: white;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.jigong-table-inner td {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #e4e7ed;
  font-size: 14px;
}

.jigong-table-inner tbody tr:nth-child(even) {
  background-color: #f5f7fa;
}

.jigong-table-inner tbody tr:hover {
  background-color: #ecf5ff;
}

.jigong-label {
  background-color: #67c23a !important;
  color: white !important;
  font-weight: bold;
}

.sike-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  direction: rtl;
}

.sike-item {
  background: white;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  direction: ltr;
}

.sike-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.sike-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.sike-content .tiangan {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.sike-content .dizhi {
  font-size: 18px;
  font-weight: bold;
  color: #67c23a;
}

.sanchuan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.sanchuan-item {
  background: white;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sanchuan-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: bold;
}

.sanchuan-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sanchuan-content .tiangan {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.sanchuan-content .dizhi {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
}

.sanchuan-content .shenjiang {
  font-size: 14px;
  color: #e6a23c;
  background-color: #fdf6ec;
  padding: 4px 8px;
  border-radius: 4px;
}

.pan-grid-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin: 0 auto;
  position: relative;
}

.pan-grid-16 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
  width: 600px;
  height: 600px;
}

.pan-grid-cell {
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  padding: 10px;
  position: relative;
  min-height: 200px;
  background-color: white;
}

.pan-grid-cell.has-content {
  border: 2px solid #409eff;
  background-color: #f0f9ff;
}

.cell-number {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  background-color: #f0f0f0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
}

.part-label {
  font-size: 10px;
  color: #fff;
  background-color: #909399;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.tianpan-part {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding-bottom: 8px;
}

.tianpan-part .part-label {
  background-color: #409eff;
}

.dipan-part {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding-top: 8px;
}

.dipan-part .part-label {
  background-color: #67c23a;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #ddd;
  margin: 4px 0;
}

.fangwei-label {
  font-size: 11px;
  color: #909399;
  font-weight: bold;
  margin-top: 8px;
  padding: 2px 6px;
  background-color: #f5f7fa;
  border-radius: 3px;
}

.dizhi-label {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-top: 5px;
}

.tianpan-dizhi {
  color: #409eff;
  font-weight: bold;
}

.dipan-dizhi {
  color: #67c23a;
  font-weight: bold;
}

.yuejiang-info,
.shenjiang-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.info-label {
  font-size: 11px;
  color: #666;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2px;
}

.yuejiang-name {
  font-size: 13px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: bold;
  width: 100%;
}

.yuejiang-dizhi {
  font-size: 11px;
  color: #67c23a;
  font-weight: normal;
  margin-left: 4px;
}

.shenjiang-label {
  font-size: 13px;
  color: #e6a23c;
  background-color: #fdf6ec;
  padding: 4px 8px;
  border-radius: 3px;
  width: 100%;
}

.shenjiang-label.guiren {
  color: #fff;
  background-color: #f56c6c;
  font-weight: bold;
}

.empty-cell {
  background-color: #f5f7fa;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-label {
  font-size: 16px;
  font-weight: bold;
  color: #999;
}

.pan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 350px;
  position: relative;
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

@media (max-width: 768px) {
  .sike-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sanchuan-grid {
    grid-template-columns: 1fr;
  }
  
  .pan-grid-container {
    padding: 15px;
  }
  
  .pan-grid-16 {
    width: 480px;
    height: 480px;
    gap: 8px;
  }
  
  .pan-grid-cell {
    min-height: 160px;
    padding: 8px;
  }
  
  .dizhi-label {
    font-size: 18px;
  }
  
  .tianpan-part,
  .dipan-part {
    gap: 2px;
  }
  
  .part-label {
    font-size: 9px;
    padding: 1px 4px;
  }
  
  .container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .pan-grid-container {
    padding: 10px;
  }
  
  .pan-grid-16 {
    width: 360px;
    height: 360px;
    gap: 6px;
  }
  
  .pan-grid-cell {
    min-height: 140px;
    padding: 6px;
  }
  
  .dizhi-label {
    font-size: 16px;
  }
  
  .tianpan-part,
  .dipan-part {
    gap: 2px;
  }
  
  .part-label {
    font-size: 8px;
    padding: 1px 3px;
  }
  
  .yuejiang-name,
  .shenjiang-label {
    font-size: 10px;
  }
  
  .fangwei-label {
    font-size: 10px;
  }
  
  .info-label {
    font-size: 10px;
  }
  
  .yuejiang-name,
  .shenjiang-label {
    font-size: 11px;
  }
  
  .empty-label {
    font-size: 14px;
  }
}
</style>

