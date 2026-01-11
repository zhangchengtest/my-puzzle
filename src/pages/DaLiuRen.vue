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
                  <span class="tiangan">{{ ke.tiangan }}</span>
                  <span class="dizhi">{{ ke.dizhi }}</span>
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
                  <span class="shenjiang" v-if="panData.sanchuan.chuan.shenjiang">{{ panData.sanchuan.chuan.shenjiang }}</span>
                </div>
              </div>
              <div class="sanchuan-item">
                <div class="sanchuan-label">中传</div>
                <div class="sanchuan-content">
                  <span class="tiangan">{{ panData.sanchuan.zhong.tiangan }}</span>
                  <span class="dizhi">{{ panData.sanchuan.zhong.dizhi }}</span>
                  <span class="shenjiang" v-if="panData.sanchuan.zhong.shenjiang">{{ panData.sanchuan.zhong.shenjiang }}</span>
                </div>
              </div>
              <div class="sanchuan-item">
                <div class="sanchuan-label">末传</div>
                <div class="sanchuan-content">
                  <span class="tiangan">{{ panData.sanchuan.mo.tiangan }}</span>
                  <span class="dizhi">{{ panData.sanchuan.mo.dizhi }}</span>
                  <span class="shenjiang" v-if="panData.sanchuan.mo.shenjiang">{{ panData.sanchuan.mo.shenjiang }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 地盘天盘显示 -->
          <div class="dipan-tianpan-section">
            <h3>地盘天盘（十二神将）</h3>
            <div class="dipan-tianpan-grid">
              <div 
                v-for="(cell, index) in panData.dipanTianpan" 
                :key="index"
                class="dipan-tianpan-cell"
                :class="{ 'guiren': cell.shenjiang === '贵人' }"
              >
                <div class="dizhi-label">{{ cell.dizhi }}</div>
                <div class="yuejiang" v-if="cell.yuejiang">
                  <span class="yuejiang-label">月将</span>
                  <span class="yuejiang-name">{{ cell.yuejiang }}</span>
                </div>
                <div class="shenjiang-label" v-if="cell.shenjiang">{{ cell.shenjiang }}</div>
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
              <span class="label">月将：</span>
              <span>{{ panData.yuejiang }}</span>
            </div>
            <div class="info-item">
              <span class="label">占时：</span>
              <span>{{ panData.timeBranch }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      
      // 计算月将
      const yuejiang = this.getYuejiang(month, day);
      
      // 计算四课
      const sike = this.calculateSike(dayGanZhi);
      
      // 计算三传
      const sanchuan = this.calculateSanchuan(sike, timeGanZhi);
      
      // 计算地盘天盘
      const dipanTianpan = this.calculateDipanTianpan(yuejiang, timeGanZhi);
      
      this.panData = {
        solarDate: `${year}年${month}月${day}日 ${hour}时${minute}分`,
        lunarDate: lunarDate,
        dayGanZhi: dayGanZhi,
        timeGanZhi: timeGanZhi,
        timeBranch: timeBranch,
        yuejiang: yuejiang,
        sike: sike,
        sanchuan: sanchuan,
        dipanTianpan: dipanTianpan
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
    // 计算月将（根据节气确定）
    getYuejiang(month, day) {
      // 月将对应关系（根据节气）
      // 月将顺序：登明(亥)、神后(子)、大吉(丑)、功曹(寅)、太冲(卯)、天罡(辰)、
      //           太乙(巳)、胜光(午)、小吉(未)、传送(申)、从魁(酉)、河魁(戌)
      // 对应节气：雨水、春分、谷雨、小满、夏至、大暑、处暑、秋分、霜降、小雪、冬至、大寒
      
      const yuejiangNames = [
        '登明', '神后', '大吉', '功曹', '太冲', '天罡',
        '太乙', '胜光', '小吉', '传送', '从魁', '河魁'
      ];
      
      // 简化处理：根据月份大致确定月将
      // 实际应该根据节气精确计算
      // 雨水(2月)后登明，春分(3月)后神后，以此类推
      let yuejiangIndex = 0;
      if (month >= 2 && month < 3) yuejiangIndex = 0; // 登明
      else if (month >= 3 && month < 4) yuejiangIndex = 1; // 神后
      else if (month >= 4 && month < 5) yuejiangIndex = 2; // 大吉
      else if (month >= 5 && month < 6) yuejiangIndex = 3; // 功曹
      else if (month >= 6 && month < 7) yuejiangIndex = 4; // 太冲
      else if (month >= 7 && month < 8) yuejiangIndex = 5; // 天罡
      else if (month >= 8 && month < 9) yuejiangIndex = 6; // 太乙
      else if (month >= 9 && month < 10) yuejiangIndex = 7; // 胜光
      else if (month >= 10 && month < 11) yuejiangIndex = 8; // 小吉
      else if (month >= 11 && month < 12) yuejiangIndex = 9; // 传送
      else if (month === 12) yuejiangIndex = 10; // 从魁
      else yuejiangIndex = 11; // 河魁（1月）
      
      return yuejiangNames[yuejiangIndex];
    },
    // 计算四课
    calculateSike(dayGanZhi) {
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
      
      // 第一课：日干上神（日干寄宫的地支）
      const dayGanIndex = gan.indexOf(dayGan);
      // 天干寄宫：甲寄寅，乙寄辰，丙戊寄巳，丁己寄未，庚寄申，辛寄戌，壬寄亥，癸寄丑
      const ganJigong = {
        '甲': '寅', '乙': '辰', '丙': '巳', '丁': '未', '戊': '巳',
        '己': '未', '庚': '申', '辛': '戌', '壬': '亥', '癸': '丑'
      };
      const firstKeDizhi = ganJigong[dayGan] || '寅';
      const firstKeTiangan = dayGan;
      
      // 第二课：日支上神（日支的地支）
      const secondKeDizhi = dayZhi;
      // 日支上神的天干取日支藏干的本气
      const secondKeTiangan = dizhiCanggan[dayZhi] ? dizhiCanggan[dayZhi][0] : gan[dayGanIndex];
      
      // 第三课：第一课上神（第一课地支的寄宫）
      const thirdKeDizhi = firstKeDizhi;
      const thirdKeTiangan = firstKeTiangan;
      
      // 第四课：第二课上神（第二课地支的寄宫）
      const fourthKeDizhi = secondKeDizhi;
      const fourthKeTiangan = secondKeTiangan;
      
      return [
        { tiangan: firstKeTiangan, dizhi: firstKeDizhi },
        { tiangan: secondKeTiangan, dizhi: secondKeDizhi },
        { tiangan: thirdKeTiangan, dizhi: thirdKeDizhi },
        { tiangan: fourthKeTiangan, dizhi: fourthKeDizhi }
      ];
    },
    // 计算三传
    calculateSanchuan(sike, timeGanZhi) {
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
      const chuanDizhi = sike[0].dizhi; // 初传
      const zhongDizhi = sike[1].dizhi; // 中传
      // 末传：根据中传确定（简化处理）
      const zhiIndex = zhi.indexOf(zhongDizhi);
      const moDizhi = zhi[(zhiIndex + 1) % 12]; // 末传
      
      const chuan = {
        tiangan: sike[0].tiangan,
        dizhi: chuanDizhi,
        shenjiang: this.getShenjiang(chuanDizhi, timeGanZhi)
      };
      
      const zhong = {
        tiangan: sike[1].tiangan,
        dizhi: zhongDizhi,
        shenjiang: this.getShenjiang(zhongDizhi, timeGanZhi)
      };
      
      const mo = {
        tiangan: sike[2].tiangan,
        dizhi: moDizhi,
        shenjiang: this.getShenjiang(moDizhi, timeGanZhi)
      };
      
      return { chuan, zhong, mo };
    },
    // 计算十二神将
    getShenjiang(dizhi, timeGanZhi) {
      // 十二神将顺序：贵人、螣蛇、朱雀、六合、勾陈、青龙、
      //               天空、白虎、太常、玄武、太阴、天后
      const shenjiangList = ['贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', 
                              '天空', '白虎', '太常', '玄武', '太阴', '天后'];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 贵人的确定：根据时干
      // 甲戊庚日：丑未为贵人（昼贵在未，夜贵在丑）
      // 乙己日：子申为贵人（昼贵在申，夜贵在子）
      // 丙丁日：亥酉为贵人（昼贵在酉，夜贵在亥）
      // 壬癸日：卯巳为贵人（昼贵在巳，夜贵在卯）
      // 辛日：午寅为贵人（昼贵在寅，夜贵在午）
      
      const timeGan = timeGanZhi[0];
      const timeZhi = timeGanZhi[1];
      
      // 判断昼夜：子时至午时为昼，午时至子时为夜
      const timeZhiIndex = zhi.indexOf(timeZhi);
      const isDay = timeZhiIndex >= 0 && timeZhiIndex < 6; // 子到巳为昼
      
      let guirenDizhi;
      if (timeGan === '甲' || timeGan === '戊' || timeGan === '庚') {
        guirenDizhi = isDay ? '未' : '丑';
      } else if (timeGan === '乙' || timeGan === '己') {
        guirenDizhi = isDay ? '申' : '子';
      } else if (timeGan === '丙' || timeGan === '丁') {
        guirenDizhi = isDay ? '酉' : '亥';
      } else if (timeGan === '壬' || timeGan === '癸') {
        guirenDizhi = isDay ? '巳' : '卯';
      } else { // 辛
        guirenDizhi = isDay ? '寅' : '午';
      }
      
      // 确定贵人的顺逆：甲戊庚日顺行，乙己日逆行，丙丁日顺行，壬癸日逆行，辛日顺行
      const isShun = (timeGan === '甲' || timeGan === '戊' || timeGan === '庚' || 
                      timeGan === '丙' || timeGan === '丁' || timeGan === '辛');
      
      // 计算当前地支相对于贵人的位置
      const guirenIndex = zhi.indexOf(guirenDizhi);
      const dizhiIndex = zhi.indexOf(dizhi);
      
      let offset;
      if (isShun) {
        offset = (dizhiIndex - guirenIndex + 12) % 12;
      } else {
        offset = (guirenIndex - dizhiIndex + 12) % 12;
      }
      
      return shenjiangList[offset];
    },
    // 计算地盘天盘
    calculateDipanTianpan(yuejiang, timeGanZhi) {
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
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
      
      // 计算每个地支位置的神将和月将
      const dipanTianpan = zhi.map((dz, index) => {
        // 计算天盘月将位置：月将加在时支上
        // 天盘位置 = (地盘位置 - 时支位置 + 月将位置 + 12) % 12
        const tianpanIndex = (index - timeZhiIndex + yuejiangIndex + 12) % 12;
        const tianpanDizhi = zhi[tianpanIndex];
        
        // 判断该位置是否有月将
        let yuejiangName = null;
        if (tianpanDizhi === yuejiangDizhi) {
          yuejiangName = yuejiang;
        }
        
        // 计算神将
        const shenjiang = this.getShenjiang(dz, timeGanZhi);
        
        return {
          dizhi: dz,
          yuejiang: yuejiangName,
          shenjiang: shenjiang
        };
      });
      
      return dipanTianpan;
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

.pan-section {
  margin-top: 30px;
}

.pan-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.sike-section,
.sanchuan-section,
.dipan-tianpan-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.sike-section h3,
.sanchuan-section h3,
.dipan-tianpan-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
  text-align: center;
}

.sike-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.sike-item {
  background: white;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sike-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.sike-content {
  display: flex;
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

.dipan-tianpan-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.dipan-tianpan-cell {
  background: white;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.dipan-tianpan-cell.guiren {
  background-color: #fef0f0;
  border: 2px solid #f56c6c;
}

.dizhi-label {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.yuejiang {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 5px;
}

.yuejiang-label {
  font-size: 10px;
  color: #666;
}

.yuejiang-name {
  font-size: 12px;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
}

.shenjiang-label {
  font-size: 12px;
  color: #e6a23c;
  background-color: #fdf6ec;
  padding: 2px 6px;
  border-radius: 3px;
}

.pan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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

@media (max-width: 768px) {
  .sike-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sanchuan-grid {
    grid-template-columns: 1fr;
  }
  
  .dipan-tianpan-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .container {
    padding: 15px;
  }
}
</style>

