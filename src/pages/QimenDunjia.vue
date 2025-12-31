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
                @click="copyCellInfo(cell, index)"
                title="点击复制宫位信息"
              >
                <div class="cell-content">
                  <!-- 空行分隔 -->
                  <div class="section-divider"></div>
                  
                  <!-- 天盘部分 -->
                  <div class="tianpan-section">
                    <div class="cell-tiangan-tianpan">
                      <span>{{ cell.tianganTianPan }}</span>
                      <span v-if="cell.tianganTianPan && getChangShengDizhi(cell.tianganTianPan)" class="changsheng-dizhi">{{ getChangShengDizhi(cell.tianganTianPan) }}</span>
                      <span v-if="cell.tianganTianPan && cell.dizhiDiPan && cell.dizhiDiPan.length > 0 && getChangShengState(cell.tianganTianPan, cell.dizhiDiPan[0])" class="changsheng-state">{{ getChangShengState(cell.tianganTianPan, cell.dizhiDiPan[0]) }}</span>
                      <span v-if="cell.tianganTianPan && getTianganWuxing(cell.tianganTianPan)" class="wuxing-label">{{ getTianganWuxing(cell.tianganTianPan) }}</span>
                      <span class="info-label">天盘天干</span>
                    </div>
                    <div class="cell-bamen-tianpan" v-if="cell.bamenTianPan">
                      <span>{{ cell.bamenTianPan }}</span>
                      <span v-if="getBamenWuxing(cell.bamenTianPan)" class="wuxing-label">{{ getBamenWuxing(cell.bamenTianPan) }}</span>
                      <span class="info-label">天盘门</span>
                      <span v-if="cell.isZhiShiMen" class="zhi-shi-label">值使</span>
                    </div>
                    <div class="cell-jiuxing-tianpan" v-if="cell.jiuxingTianPan">
                      <span>{{ cell.jiuxingTianPan }}</span>
                      <span v-if="getJiuxingWuxing(cell.jiuxingTianPan)" class="wuxing-label">{{ getJiuxingWuxing(cell.jiuxingTianPan) }}</span>
                      <span class="info-label">天盘星</span>
                    </div>
                  </div>
                  
                  <!-- 空行分隔 -->
                  <div class="section-divider"></div>
                  
                  <!-- 吉凶格信息 -->
                  <div class="jixiong-ge-section" v-if="cell.tianganTianPan && cell.tianganDiPan && getJixiongGe(cell.tianganTianPan, cell.tianganDiPan)">
                    <div class="jixiong-ge-info">
                      <span class="jixiong-ge-name">{{ getJixiongGe(cell.tianganTianPan, cell.tianganDiPan).name }}</span>
                      <span :class="['jixiong-label', 'jixiong-' + getJixiongGe(cell.tianganTianPan, cell.tianganDiPan).jixiong]">
                        {{ getJixiongGe(cell.tianganTianPan, cell.tianganDiPan).jixiong }}
                      </span>
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
                      <span v-if="cell.isZhiShiMenDiPan" class="zhi-shi-label">值使</span>
                    </div>
                    <div class="cell-jiuxing-dipan" v-if="cell.jiuxingDiPan">
                      <span>{{ cell.jiuxingDiPan }}</span>
                      <span class="info-label">地盘星</span>
                    </div>
                    <div class="cell-dizhi-dipan" v-if="cell.dizhiDiPan && cell.dizhiDiPan.length > 0">
                      <span v-for="(dz, idx) in cell.dizhiDiPan" :key="idx">
                        <span :class="{ 'kongwang-dizhi': cell.hasKongWang }">{{ dz }}</span>
                        <span v-if="idx < cell.dizhiDiPan.length - 1">、</span>
                      </span>
                      <span class="info-label">地支</span>
                      <span v-if="cell.hasKongWang" class="kongwang-label">空亡</span>
                    </div>
                  </div>
                  
                  <!-- 值符信息放在右上角 -->
                  <div class="cell-bashen" v-if="cell.bashen">
                    <span>{{ cell.bashen }}</span>
                    <span v-if="getBashenWuxing(cell.bashen)" class="wuxing-label">{{ getBashenWuxing(cell.bashen) }}</span>
                    <span class="info-label">神</span>
                  </div>
                  
                  <!-- 八卦信息放在右下角 -->
                  <div class="cell-position">
                    <span>{{ getPositionName(index) }}</span>
                    <span class="position-number">{{ cell.position }}</span>
                    <span class="position-label" v-if="getGongWuxing(cell.position)">{{ getGongWuxing(cell.position) }}</span>
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
          <div class="info-item shier-changsheng-wrapper">
            <div class="shier-changsheng-table">
              <h4>十二长生</h4>
              <div class="changsheng-list">
                <span v-for="name in shierChangSheng" :key="name" class="changsheng-item">{{ name }}</span>
              </div>
            </div>
          </div>
          <div class="info-item wuxing-relation-wrapper">
            <div class="wuxing-relation-content">
              <div class="wuxing-section">
                <h4>五行相生</h4>
                <div class="wuxing-relation-list">
                  <span v-for="(item, index) in wuxingXiangSheng" :key="index" class="wuxing-relation-item">
                    <span class="wuxing-from">{{ item.from }}</span>
                    <span class="wuxing-arrow">生</span>
                    <span class="wuxing-to">{{ item.to }}</span>
                    <span v-if="index < wuxingXiangSheng.length - 1" class="wuxing-separator">→</span>
                  </span>
                </div>
              </div>
              <div class="wuxing-section">
                <h4>五行相克</h4>
                <div class="wuxing-relation-list">
                  <span v-for="(item, index) in wuxingXiangKe" :key="index" class="wuxing-relation-item">
                    <span class="wuxing-from">{{ item.from }}</span>
                    <span class="wuxing-arrow ke">克</span>
                    <span class="wuxing-to">{{ item.to }}</span>
                    <span v-if="index < wuxingXiangKe.length - 1" class="wuxing-separator">→</span>
                  </span>
                </div>
              </div>
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
    
    <!-- 复制提示 -->
    <transition name="fade">
      <div v-if="copyMessage" class="copy-message">
        {{ copyMessage }}
      </div>
    </transition>
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
      analysisResult: null,
      copyMessage: '',
      copyMessageTimer: null,
      changShengMap: {
        '甲': '亥',
        '乙': '午',
        '丙': '寅',
        '丁': '酉',
        '戊': '寅',
        '己': '酉',
        '庚': '巳',
        '辛': '子',
        '壬': '申',
        '癸': '卯'
      }
    };
  },
  computed: {
    changShengList() {
      const tianGanOrder = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      return tianGanOrder.map(tiangan => ({
        tiangan: tiangan,
        dizhi: this.changShengMap[tiangan]
      }));
    },
    shierChangSheng() {
      return ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
    },
    wuxingXiangSheng() {
      return [
        { from: '木', to: '火' },
        { from: '火', to: '土' },
        { from: '土', to: '金' },
        { from: '金', to: '水' },
        { from: '水', to: '木' }
      ];
    },
    wuxingXiangKe() {
      return [
        { from: '木', to: '土' },
        { from: '土', to: '水' },
        { from: '水', to: '火' },
        { from: '火', to: '金' },
        { from: '金', to: '木' }
      ];
    }
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
      const dayGanZhi = this.getDayGanZhi(year, month, day, hour, minute);
      
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
    /**
     * 公历 + 时分 → 日干支（子初换日：23:00）
     */
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
    
    /**
     * Gregorian → Julian Day Number
     */
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
      // 计算日干支（子初换日：23点以后算第二天）
      const dayGanZhi = this.getDayGanZhi(year, month, day, hour, 0);
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
    // 根据旬首获取空亡地支
    getKongWangDizhi(xunShouGanZhi) {
      const kongWangMap = {
        '甲子': ['戌', '亥'],
        '甲戌': ['申', '酉'],
        '甲申': ['午', '未'],
        '甲午': ['辰', '巳'],
        '甲辰': ['寅', '卯'],
        '甲寅': ['子', '丑']
      };
      return kongWangMap[xunShouGanZhi] || [];
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
      const baShen = ['值符', '腾蛇', '太阴', '六合', '白虎（勾陈）', '玄武（朱雀）', '九地', '九天'];
      
      // 九宫格位置（洛书顺序）
      const positions = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 巽4、离9、坤2、震3、中5、兑7、艮8、坎1、乾6
      
      // 计算每个宫位对应的地支（包括寄宫）
      // 四正地支：子(坎1)、午(离9)、卯(震3)、酉(兑7)
      // 四隅地支：寅(艮8)、申(坤2)、巳(巽4)、亥(乾6)
      // 四库地支（寄宫）：辰寄巽4、戌寄乾6、丑寄艮8、未寄坤2
      const getDizhiByGong = (gong) => {
        const dizhiMap = {
          1: ['子'],      // 坎宫：子
          2: ['申', '未'], // 坤宫：申、未（未寄坤）
          3: ['卯'],      // 震宫：卯
          4: ['巳', '辰'], // 巽宫：巳、辰（辰寄巽）
          5: [],          // 中5宫：无地支
          6: ['亥', '戌'], // 乾宫：亥、戌（戌寄乾）
          7: ['酉'],      // 兑宫：酉
          8: ['寅', '丑'], // 艮宫：寅、丑（丑寄艮）
          9: ['午']       // 离宫：午
        };
        return dizhiMap[gong] || [];
      };
      
      // 1. 确定旬首
      const xunShou = this.getXunShou(timeGanZhi);
      
      // 获取空亡地支
      const kongWangDizhi = this.getKongWangDizhi(xunShou.ganZhi);
      
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
      
      // 当值使落中五宫时，阳遁局转到艮8宫，阴遁局转到坤2宫
      if (zhiShiMenPosition === 5) {
        if (isYangDun) {
          zhiShiMenPosition = 8; // 阳遁转到艮8宫
        } else {
          zhiShiMenPosition = 2; // 阴遁转到坤2宫
        }
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
      // 计算值使门移动的步数（从地盘到天盘）
      // 注意：当值使落中五宫时，已转换为艮8宫（阳遁）或坤2宫（阴遁），所以这里不会出现5宫的情况
      const zhiShiMenTianPanIndex = getBamenOrderIndex(zhiShiMenPosition);
      let zhiShiMenMoveSteps = zhiShiMenTianPanIndex - zhiShiMenDiPanIndex;
      if (zhiShiMenMoveSteps < 0) {
        zhiShiMenMoveSteps += bamenOrder.length;
      }
      
      // 计算每个宫位的门（天盘）
      // 八门按照指定顺序旋转，值使门从地盘位置移动到天盘位置
      // 所有门都按照相同的步数在八门顺序中旋转
      // 注意：当值使落中五宫时，已转换为艮8宫（阳遁）或坤2宫（阴遁），所以值使门会正常移动
      const getBamenTianPanByGong = (gong) => {
        // 中5宫始终没有门
        if (gong === 5) {
          return null;
        }
        
        // 如果值使门移动步数为0，直接返回地盘门
        if (zhiShiMenMoveSteps === 0) {
          return getBamenDiPanByGong(gong);
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
      
      // 八神旋转顺序：与八门顺序一致：[6, 1, 8, 3, 4, 9, 2, 7]（不包括中5宫）
      const bashenOrder = [6, 1, 8, 3, 4, 9, 2, 7]; // 八神宫位顺序（不包括中5宫）
      // 八神顺序：值符、腾蛇、太阴、六合、白虎（勾陈）、玄武（朱雀）、九地、九天
      const bashenNames = ['值符', '腾蛇', '太阴', '六合', '白虎（勾陈）', '玄武（朱雀）', '九地', '九天'];
      
      // 计算值符在八神顺序中的位置
      // 值符在值符星的位置（zhiFuPosition）
      const getBashenOrderIndex = (gong) => {
        return bashenOrder.indexOf(gong);
      };
      
      // 计算每个宫位的八神（天盘）
      // 八神按照指定顺序旋转，值符从地盘位置移动到天盘位置
      // 其他神按照固定顺序（腾蛇、太阴、六合、白虎（勾陈）、玄武（朱雀）、九地、九天）依次排列
      const getBashenByGong = (gong) => {
        // 中5宫没有八神
        if (gong === 5) {
          return null;
        }
        
        // 找到值符在天盘的位置在八神顺序中的索引
        const zhiFuBashenIndex = getBashenOrderIndex(zhiFuPosition);
        if (zhiFuBashenIndex === -1) {
          // 值符在5宫，不显示八神
          return null;
        }
        
        // 找到当前宫位在八神顺序中的索引
        const gongIndex = getBashenOrderIndex(gong);
        if (gongIndex === -1) {
          return null;
        }
        
        // 计算当前宫位相对于值符位置的偏移
        // 值符在索引0的位置（值符），其他神依次排列
        let offset = (gongIndex - zhiFuBashenIndex + bashenOrder.length) % bashenOrder.length;
        
        // 返回对应的八神名称
        return bashenNames[offset];
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
        
        // 计算该宫位的地支（地盘，根据宫位分配）
        const dizhiDiPan = getDizhiByGong(pos);
        
        // 检查该宫位的地支是否为空亡
        const hasKongWang = dizhiDiPan.some(dz => kongWangDizhi.includes(dz));
        
        // 计算该宫位的八神（天盘，按照固定顺序排列）
        const bashen = getBashenByGong(pos);
        
        // 确定值使门是否在此宫位（天盘位置）
        // 注意：当值使落中五宫时，已转换为艮8宫（阳遁）或坤2宫（阴遁），所以值使门标记在转换后的位置
        let isZhiShiMen = (pos === zhiShiMenPosition);
        // 确定值使门是否在此宫位（地盘位置）
        let isZhiShiMenDiPan = (pos === zhiShiMenDiPanGong);
        
        grid.push({
          position: pos,
          tianganDiPan: tianganDiPan,
          tianganTianPan: tianganTianPan,
          dizhi: diZhi[dizhiOffset % 12], // 保留原有字段以兼容
          dizhiDiPan: dizhiDiPan, // 地盘地支（根据宫位分配）
          bamenDiPan: bamenDiPan,
          bamenTianPan: bamenTianPan,
          jiuxingDiPan: jiuxingDiPan,
          jiuxingTianPan: jiuxingTianPan,
          jiuxing: jiuxingDiPan, // 保留原有字段以兼容，使用地盘星
          bashen: bashen,
          isZhiShiMen: isZhiShiMen, // 天盘位置
          isZhiShiMenDiPan: isZhiShiMenDiPan, // 地盘位置
          zhiShiMen: zhiShiMen,
          hasKongWang: hasKongWang // 是否为空亡
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
    // 根据宫位获取五行属性
    getGongWuxing(position) {
      const wuxingMap = {
        1: '水', // 坎宫
        2: '土', // 坤宫
        3: '木', // 震宫
        4: '木', // 巽宫
        5: '土', // 中宫
        6: '金', // 乾宫
        7: '金', // 兑宫
        8: '土', // 艮宫
        9: '火'  // 离宫
      };
      return wuxingMap[position] || '';
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
    // 根据天干获取对应的长生地支
    getChangShengDizhi(tiangan) {
      const changShengMap = {
        '甲': '亥',
        '乙': '午',
        '丙': '寅',
        '丁': '酉',
        '戊': '寅',
        '己': '酉',
        '庚': '巳',
        '辛': '子',
        '壬': '申',
        '癸': '卯'
      };
      return changShengMap[tiangan] || '';
    },
    // 根据天干和地支获取十二长生状态
    getChangShengState(tiangan, dizhi) {
      if (!tiangan || !dizhi) return '';
      
      // 十二长生状态顺序
      const changShengStates = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
      
      // 地支顺序
      const dizhiOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      
      // 获取天干的长生地支
      const changShengDizhi = this.getChangShengDizhi(tiangan);
      if (!changShengDizhi) return '';
      
      // 判断是阳干还是阴干
      const yangGan = ['甲', '丙', '戊', '庚', '壬'];
      const isYangGan = yangGan.includes(tiangan);
      
      // 获取长生地支在地支顺序中的索引
      const changShengIndex = dizhiOrder.indexOf(changShengDizhi);
      // 获取当前地支在地支顺序中的索引
      const dizhiIndex = dizhiOrder.indexOf(dizhi);
      
      if (changShengIndex === -1 || dizhiIndex === -1) return '';
      
      let offset;
      if (isYangGan) {
        // 阳干：从长生地支开始顺行
        offset = (dizhiIndex - changShengIndex + 12) % 12;
      } else {
        // 阴干：从长生地支开始逆行
        offset = (changShengIndex - dizhiIndex + 12) % 12;
      }
      
      return changShengStates[offset] || '';
    },
    // 根据天盘天干和地盘天干获取吉凶格信息
    getJixiongGe(tianganTianPan, tianganDiPan) {
      if (!tianganTianPan || !tianganDiPan) return null;
      
      const jixiongGeMap = {
        '戊戊': { name: '伏吟', jixiong: '凶', meaning: '本地、内部、推迟，以守为主' },
        '戊乙': { name: '青龙和会', jixiong: '中', meaning: '门吉事吉，门凶事凶' },
        '乙戊': { name: '阴害阳门', jixiong: '中', meaning: '利于阴人阴事，不利阳人阳事，吉凶看门' },
        '戊丙': { name: '龙回首', jixiong: '吉', meaning: '第一吉格，大吉大利，凶事遇门迫、入墓、击刑则不利' },
        '丙戊': { name: '鸟跌穴', jixiong: '吉', meaning: '第二吉格，大吉大利，凶事遇门迫、入墓、击刑则不利' },
        '戊丁': { name: '青龙腾明', jixiong: '吉', meaning: '第三吉格，利于见贵人、求取功名，遇门迫、入墓不利' },
        '丁戊': { name: '青龙转光', jixiong: '吉', meaning: '第四吉格，好事更加顺利，遇门迫、入墓不利' },
        '戊己': { name: '贵人入狱', jixiong: '凶', meaning: '于公私均不利，冲墓之时有转机' },
        '己戊': { name: '犬遇青龙', jixiong: '中', meaning: '门吉则事吉，门凶则事不成' },
        '戊庚': { name: '值符飞宫', jixiong: '凶', meaning: '好事不成，凶事更凶，值符飞离此宫，主换人、换地方' },
        '庚戊': { name: '值符伏宫', jixiong: '凶', meaning: '大凶，主换人、换地方，但庚为用神另当别论' },
        '戊辛': { name: '青龙折足', jixiong: '中', meaning: '吉门生助可谋事，凶门主招灾失财、足疾、折伤' },
        '辛戊': { name: '困龙被伤', jixiong: '凶', meaning: '妄动财失伤灾，辛为用神反为吉，但子午冲，有失财的风险。' },
        '戊壬': { name: '青龙入天牢', jixiong: '凶', meaning: '公私皆不利' },
        '壬戊': { name: '小蛇化龙', jixiong: '吉', meaning: '男主事业发达，女主产婴童' },
        '戊癸': { name: '青龙华盖', jixiong: '中', meaning: '门吉则事吉，门凶则事凶' },
        '癸戊': { name: '天乙会合', jixiong: '中', meaning: '门吉则事吉，门凶则事凶' },
        '乙乙': { name: '日奇伏吟', jixiong: '凶', meaning: '宜静不宜动，宜守不宜攻' },
        '乙丙': { name: '奇仪顺遂', jixiong: '吉', meaning: '乙奇临吉凶，本质好，升职顺遂；临凶星，与第三方男子苟合，婚变' },
        '丙乙': { name: '日月并行', jixiong: '吉', meaning: '公私皆有利' },
        '乙丁': { name: '奇仪相佐', jixiong: '吉', meaning: '利文书、考试，百事可为' },
        '丁乙': { name: '玉女奇生', jixiong: '吉', meaning: '贵人加官晋爵，常人婚姻财帛有喜' },
        '乙己': { name: '日奇入墓', jixiong: '中', meaning: '门吉有救，门凶事凶。遇开门为地遁吉格' },
        '己乙': { name: '地户逢星', jixiong: '凶', meaning: '宜遁迹隐形，宜退不宜进' },
        '乙庚': { name: '日奇被刑', jixiong: '凶', meaning: '夫妻不和，争讼财产' },
        '庚乙': { name: '太白逢星', jixiong: '凶', meaning: '宜退不宜进，对客有利，对主不利' },
        '乙辛': { name: '龙逃走', jixiong: '凶', meaning: '家破人亡，财散人走。婚姻主女方提离婚，离开男方' },
        '辛乙': { name: '虎猖狂', jixiong: '凶', meaning: '家破人亡，远行有灾。婚姻主男方提离婚，拆散家庭' },
        '乙壬': { name: '日奇入天罗', jixiong: '凶', meaning: '尊卑悖乱，官讼是非，有人谋害' },
        '壬乙': { name: '小蛇得势', jixiong: '吉', meaning: '男人发达，有工作俸禄地位；女人柔顺，怀孕可得儿子' },
        '乙癸': { name: '日奇入地罗', jixiong: '凶', meaning: '宜退不宜进，躲灾避难为吉' },
        '癸乙': { name: '华盖逢星', jixiong: '中', meaning: '吉门主贵人禄位、常人平安；凶门则凶上加凶；癸为用神则为吉' },
        '丙丙': { name: '月奇悖师', jixiong: '凶', meaning: '文书逼迫，破耗遗失' },
        '丙丁': { name: '星奇朱雀', jixiong: '吉', meaning: '贵人文书吉利，常人平安喜乐，遇开生休吉门为天遁吉格' },
        '丁丙': { name: '星随月转', jixiong: '中', meaning: '贵人越级高开，发展顺遂；常人阴阳颠倒，乐极生悲，造成不幸' },
        '丙己': { name: '火悖入刑', jixiong: '凶', meaning: '门吉得吉，门凶得凶。主囚人刑仗，文书不行' },
        '己丙': { name: '火悖地户', jixiong: '凶', meaning: '男人冤冤相害，女人遭人奸污' },
        '丙庚': { name: '萤入太白', jixiong: '凶', meaning: '谋求好事大凶，主门户破败，盗贼横行，事业难成。"贼退格"，测贼退为吉' },
        '庚丙': { name: '白入萤', jixiong: '凶', meaning: '"贼来格"，占贼必来，以固守为好。若日干为庚或年命为庚为吉，主动出击，先发制人，就会利于自己' },
        '丙辛': { name: '月奇相合', jixiong: '吉', meaning: '测事可成，测病亦不为凶' },
        '辛丙': { name: '干合悖师', jixiong: '中', meaning: '门吉事吉，门凶事凶。合作求财，会因财致讼' },
        '丙壬': { name: '火入天罗', jixiong: '凶', meaning: '为客不利，是非颇多' },
        '壬丙': { name: '水蛇入火', jixiong: '凶', meaning: '官灾刑禁，络绎不绝，两败俱伤' },
        '丙癸': { name: '月奇地网', jixiong: '凶', meaning: '暗昧不明，容易有小人、阴人害事，招灾祸' },
        '癸丙': { name: '华盖悖师', jixiong: '凶', meaning: '诸事不利。只有修为高超、能屈能生、因势利导的人才能变不利为有利' },
        '丁丁': { name: '星奇伏吟', jixiong: '吉', meaning: '文书、证件即至，喜事从心' },
        '丁己': { name: '火入勾陈', jixiong: '凶', meaning: '主阴私之事，谋事不利，奸私仇冤，或事因女人' },
        '己丁': { name: '地户朱雀', jixiong: '吉', meaning: '文书词讼，先曲后直，先凶后吉' },
        '丁庚': { name: '星奇受阻', jixiong: '凶', meaning: '文书阻隔，消息不同，测外出之人则归' },
        '庚丁': { name: '金屋藏娇', jixiong: '中', meaning: '男女关系所引起的官讼是非。门吉则事吉，门凶则事凶' },
        '丁辛': { name: '朱雀入狱', jixiong: '中', meaning: '地盘为罪人释放，天盘为官人失位' },
        '辛丁': { name: '狱神得奇', jixiong: '吉', meaning: '经商求财利润丰厚，做事有意外收获。赦免处分等' },
        '丁壬': { name: '奇仪相合', jixiong: '吉', meaning: '凡事有成，贵人辅助，讼狱公平。婚姻主苟合关系' },
        '壬丁': { name: '干合蛇刑', jixiong: '中', meaning: '文书牵连，贵人匆匆，男吉女凶。天盘，壬为男，遇丁奇为吉；地盘，丁为女，上有天罗为凶' },
        '丁癸': { name: '雀投江', jixiong: '凶', meaning: '文书口舌是非，词讼不利，音信全无' },
        '癸丁': { name: '蛇夭矫', jixiong: '凶', meaning: '官司诉讼，火焚也逃不掉' },
        '己己': { name: '地户逢鬼', jixiong: '凶', meaning: '疾病、发凶或必死，好事不成，谋为则凶' },
        '己庚': { name: '刑格反名', jixiong: '凶', meaning: '不宜谋事，词讼先动者不利，阴星则有谋害的可能' },
        '庚己': { name: '官府刑格', jixiong: '凶', meaning: '官司是非，判刑，牢狱之灾等' },
        '己辛': { name: '游魂入墓', jixiong: '凶', meaning: '鬼魅作祟，小心谨慎' },
        '辛己': { name: '入狱自刑', jixiong: '凶', meaning: '错误由自身造成，女仆背主，诉讼难伸' },
        '己壬': { name: '地网高张', jixiong: '凶', meaning: '谋为不利，凡事不吉，容易出狡童佚女，奸情伤杀之事' },
        '壬己': { name: '反吟蛇刑', jixiong: '凶', meaning: '官司败诉，大祸将至，顺守可吉，妄动必凶' },
        '己癸': { name: '地刑玄武', jixiong: '凶', meaning: '男女疾病垂危，囚狱词讼之灾' },
        '癸己': { name: '华盖地户', jixiong: '凶', meaning: '男女音信皆阻，躲灾避难为吉' },
        '庚庚': { name: '太白同宫、战格', jixiong: '凶', meaning: '不利谋事，不和，招来官灾横祸' },
        '庚辛': { name: '白虎干格、太白刑格', jixiong: '凶', meaning: '远行不利，诸事有灾' },
        '辛庚': { name: '白虎出力、天狱自刑', jixiong: '凶', meaning: '主客相残，不可强进' },
        '庚壬': { name: '小格、上格', jixiong: '凶', meaning: '远行迷失，音信全无。若庚为用神，主变动、变化，为"移荡格"' },
        '壬庚': { name: '太白擒蛇', jixiong: '中', meaning: '事情难以进展，如测词讼，主刑狱公平，立判邪正' },
        '庚癸': { name: '大格', jixiong: '凶', meaning: '主车祸，行人不至，官讼不息，母子俱伤' },
        '癸庚': { name: '太白入网', jixiong: '凶', meaning: '凡事无成，吉事易空，暴力争讼，自身获罪' },
        '壬壬': { name: '天狱自刑、蛇入地罗', jixiong: '凶', meaning: '谋事无成，内事索索，外入缠绕，诸事破败，灾祸起于内部。吉门吉星，尚可缓解' },
        '壬癸': { name: '天罗逢地网、幼女奸淫', jixiong: '凶', meaning: '诸事不利。阴阳交合，暧昧不明，家丑外扬。门吉为风流男女，门凶为本质坏，男女之事招灾' },
        '癸壬': { name: '复见腾蛇', jixiong: '凶', meaning: '婚姻重婚，婚后无子，不保年华。事物变化，或另找主人，另寻合作伙伴' },
        '辛辛': { name: '伏吟天庭', jixiong: '凶', meaning: '为事自破，进退不果，讼狱，公废私就' },
        '辛壬': { name: '凶蛇入狱', jixiong: '凶', meaning: '争讼不息，先动失理' },
        '壬辛': { name: '腾蛇相缠', jixiong: '凶', meaning: '吉门也不得安宁，谋望被人欺骗' },
        '辛癸': { name: '天牢华盖、虎投地网', jixiong: '凶', meaning: '日月失明，误入地网，动止乖张' },
        '癸辛': { name: '网盖天牢', jixiong: '凶', meaning: '官司败诉，死罪难逃，占病为凶' },
        '癸癸': { name: '天网四张', jixiong: '凶', meaning: '行人失伴，病讼皆伤' }
      };
      
      const key = tianganTianPan + tianganDiPan;
      return jixiongGeMap[key] || null;
    },
    // 根据天干获取五行属性
    getTianganWuxing(tiangan) {
      const wuxingMap = {
        '甲': '木',
        '乙': '木',
        '丙': '火',
        '丁': '火',
        '戊': '土',
        '己': '土',
        '庚': '金',
        '辛': '金',
        '壬': '水',
        '癸': '水'
      };
      return wuxingMap[tiangan] || '';
    },
    // 根据八门获取五行属性
    getBamenWuxing(bamen) {
      const wuxingMap = {
        '休': '水',
        '生': '土',
        '伤': '木',
        '杜': '木',
        '景': '火',
        '死': '土',
        '惊': '金',
        '开': '金'
      };
      return wuxingMap[bamen] || '';
    },
    // 根据九星获取五行属性
    getJiuxingWuxing(jiuxing) {
      const wuxingMap = {
        '天蓬': '水',
        '天芮': '土',
        '天冲': '木',
        '天辅': '木',
        '天禽': '土',
        '天心': '金',
        '天柱': '金',
        '天任': '土',
        '天英': '火'
      };
      return wuxingMap[jiuxing] || '';
    },
    // 根据八神获取五行属性
    getBashenWuxing(bashen) {
      const wuxingMap = {
        '值符': '土',
        '腾蛇': '火',
        '太阴': '金',
        '六合': '木',
        '白虎（勾陈）': '金',
        '玄武（朱雀）': '水',
        '九地': '土',
        '九天': '金'
      };
      return wuxingMap[bashen] || '';
    },
    // 复制宫位信息
    async copyCellInfo(cell, index) {
      const lines = [];
      
      // 八卦信息
      const positionName = this.getPositionName(index);
      const gongWuxing = this.getGongWuxing(cell.position);
      lines.push(`【八卦信息】`);
      lines.push(`${positionName}宫 ${cell.position}宫`);
      if (gongWuxing) {
        lines.push(`宫位五行：${gongWuxing}`);
      }
      lines.push('');
      
      // 天盘信息
      lines.push(`【天盘信息】`);
      if (cell.tianganTianPan) {
        const tianganWuxing = this.getTianganWuxing(cell.tianganTianPan);
        const changsheng = this.getChangShengDizhi(cell.tianganTianPan);
        const changshengState = cell.dizhiDiPan && cell.dizhiDiPan.length > 0 
          ? this.getChangShengState(cell.tianganTianPan, cell.dizhiDiPan[0]) 
          : '';
        let tianganInfo = `天干：${cell.tianganTianPan}`;
        if (tianganWuxing) {
          tianganInfo += `（${tianganWuxing}）`;
        }
        if (changsheng) {
          tianganInfo += ` 长生：${changsheng}`;
        }
        if (changshengState) {
          tianganInfo += ` ${changshengState}`;
        }
        lines.push(tianganInfo);
      }
      if (cell.bamenTianPan) {
        const bamenWuxing = this.getBamenWuxing(cell.bamenTianPan);
        let bamenInfo = `八门：${cell.bamenTianPan}`;
        if (bamenWuxing) {
          bamenInfo += `（${bamenWuxing}）`;
        }
        if (cell.isZhiShiMen) {
          bamenInfo += ` [值使]`;
        }
        lines.push(bamenInfo);
      }
      if (cell.jiuxingTianPan) {
        const jiuxingWuxing = this.getJiuxingWuxing(cell.jiuxingTianPan);
        let jiuxingInfo = `九星：${cell.jiuxingTianPan}`;
        if (jiuxingWuxing) {
          jiuxingInfo += `（${jiuxingWuxing}）`;
        }
        lines.push(jiuxingInfo);
      }
      lines.push('');
      
      // 吉凶格信息
      if (cell.tianganTianPan && cell.tianganDiPan) {
        const jixiongGe = this.getJixiongGe(cell.tianganTianPan, cell.tianganDiPan);
        if (jixiongGe) {
          lines.push(`【吉凶格信息】`);
          lines.push(`吉凶格：${jixiongGe.name}（${jixiongGe.jixiong}）`);
          lines.push(`含义：${jixiongGe.meaning}`);
          lines.push('');
        }
      }
      
      // 地支信息
      if (cell.dizhiDiPan && cell.dizhiDiPan.length > 0) {
        lines.push(`【地支信息】`);
        let dizhiInfo = `地支：${cell.dizhiDiPan.join('、')}`;
        if (cell.hasKongWang) {
          dizhiInfo += ` [空亡]`;
        }
        lines.push(dizhiInfo);
        lines.push('');
      }
      
      // 八神信息
      if (cell.bashen) {
        lines.push(`【八神信息】`);
        const bashenWuxing = this.getBashenWuxing(cell.bashen);
        let bashenInfo = `八神：${cell.bashen}`;
        if (bashenWuxing) {
          bashenInfo += `（${bashenWuxing}）`;
        }
        lines.push(bashenInfo);
        lines.push('');
      }
      
      // 空亡信息
      if (cell.hasKongWang && cell.dizhiDiPan && cell.dizhiDiPan.length > 0) {
        lines.push(`【空亡信息】`);
        if (this.panData && this.panData.timeGanZhi) {
          const xunShou = this.getXunShou(this.panData.timeGanZhi);
          const kongWangDizhi = this.getKongWangDizhi(xunShou.ganZhi);
          const kongWangInCell = cell.dizhiDiPan.filter(dz => kongWangDizhi.includes(dz));
          if (kongWangInCell.length > 0) {
            lines.push(`空亡地支：${kongWangInCell.join('、')}`);
          }
        } else {
          lines.push(`空亡地支：${cell.dizhiDiPan.join('、')}`);
        }
        lines.push('');
      }
      
      const text = lines.join('\n');
      
      try {
        await navigator.clipboard.writeText(text);
        this.showCopyMessage('复制成功！');
      } catch (err) {
        // 降级方案：使用传统方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.showCopyMessage('复制成功！');
        } catch (e) {
          this.showCopyMessage('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
      }
    },
    // 显示复制提示消息
    showCopyMessage(message) {
      this.copyMessage = message;
      if (this.copyMessageTimer) {
        clearTimeout(this.copyMessageTimer);
      }
      this.copyMessageTimer = setTimeout(() => {
        this.copyMessage = '';
      }, 2000);
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
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.grid-cell:hover {
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.grid-cell.zhi-fu:hover {
  background-color: #fee;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.grid-cell.center:hover {
  background-color: #fff8e0;
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
  position: relative;
}

.cell-position {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  flex-wrap: wrap;
  z-index: 10;
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
.cell-jiuxing {
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

.changsheng-dizhi {
  font-size: 12px;
  color: #67c23a;
  font-weight: normal;
  margin-left: 2px;
}

.changsheng-state {
  font-size: 11px;
  color: #409eff;
  font-weight: bold;
  margin-left: 2px;
  background-color: #ecf5ff;
  padding: 1px 4px;
  border-radius: 2px;
}

.jixiong-ge-section {
  margin: 3px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jixiong-ge-info {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.jixiong-ge-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.jixiong-label {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  color: #fff;
}

.jixiong-吉 {
  background-color: #67c23a;
}

.jixiong-凶 {
  background-color: #f56c6c;
}

.jixiong-中 {
  background-color: #e6a23c;
}

.wuxing-label {
  font-size: 11px;
  color: #e6a23c;
  font-weight: bold;
  margin-left: 2px;
  background-color: #fdf6ec;
  padding: 1px 4px;
  border-radius: 2px;
}

.cell-dizhi {
  font-size: 14px;
  color: #67c23a;
}

.cell-dizhi-dipan {
  font-size: 12px;
  color: #67c23a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin: 1px 0;
  flex-wrap: wrap;
}

.kongwang-dizhi {
  color: #f56c6c;
  text-decoration: line-through;
  opacity: 0.7;
}

.kongwang-label {
  font-size: 10px;
  color: #f56c6c;
  background-color: #fef0f0;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
  margin-left: 3px;
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
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  flex-wrap: wrap;
  z-index: 10;
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

.shier-changsheng-wrapper {
  width: 100%;
  flex-basis: 100%;
}

.shier-changsheng-table {
  margin-top: 10px;
}

.shier-changsheng-table h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.changsheng-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.changsheng-item {
  display: inline-block;
  padding: 6px 12px;
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.wuxing-relation-wrapper {
  width: 100%;
  flex-basis: 100%;
}

.wuxing-relation-content {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wuxing-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.wuxing-section h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.wuxing-relation-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}

.wuxing-relation-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.wuxing-from,
.wuxing-to {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.wuxing-from {
  background-color: #e1f3d8;
  color: #67c23a;
}

.wuxing-to {
  background-color: #f0f9ff;
  color: #409eff;
}

.wuxing-arrow {
  font-size: 14px;
  font-weight: bold;
  color: #67c23a;
}

.wuxing-arrow.ke {
  color: #f56c6c;
}

.wuxing-separator {
  font-size: 16px;
  color: #909399;
  margin: 0 3px;
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
    font-size: 10px;
    bottom: 2px;
    right: 2px;
  }
  
  .position-number {
    font-size: 11px;
  }
  
  .position-label {
    font-size: 7px;
    padding: 1px 2px;
  }
  
  .cell-tiangan,
  .cell-tiangan-tianpan {
    font-size: 13px;
  }
  
  .changsheng-dizhi {
    font-size: 10px;
    margin-left: 1px;
  }
  
  .changsheng-state {
    font-size: 9px;
    margin-left: 1px;
    padding: 1px 3px;
  }
  
  .jixiong-ge-section {
    margin: 2px 0;
  }
  
  .jixiong-ge-name {
    font-size: 10px;
  }
  
  .jixiong-label {
    font-size: 8px;
    padding: 1px 4px;
  }
  
  .wuxing-label {
    font-size: 9px;
    margin-left: 1px;
    padding: 1px 3px;
  }
  
  .cell-bamen,
  .cell-bamen-tianpan,
  .cell-jiuxing,
  .cell-jiuxing-dipan,
  .cell-jiuxing-tianpan {
    font-size: 10px;
  }
  
  .cell-dizhi-dipan {
    font-size: 9px;
    gap: 1px;
    margin: 1px 0;
  }
  
  .kongwang-label {
    font-size: 8px;
    padding: 1px 3px;
    margin-left: 2px;
  }
  
  .cell-bashen {
    font-size: 10px;
    top: 2px;
    right: 2px;
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
  
  .changsheng-list {
    padding: 8px;
    gap: 6px;
  }
  
  .changsheng-item {
    padding: 5px 10px;
    font-size: 12px;
  }
  
  .wuxing-relation-content {
    gap: 12px;
  }
  
  .wuxing-section {
    padding: 12px;
  }
  
  .wuxing-section h4 {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .wuxing-relation-list {
    gap: 4px;
  }
  
  .wuxing-from,
  .wuxing-to {
    padding: 3px 8px;
    font-size: 12px;
  }
  
  .wuxing-arrow {
    font-size: 12px;
  }
  
  .wuxing-separator {
    font-size: 14px;
    margin: 0 2px;
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
    font-size: 9px;
    bottom: 2px;
    right: 2px;
  }
  
  .position-number {
    font-size: 10px;
  }
  
  .position-label {
    font-size: 6px;
    padding: 1px 2px;
  }
  
  .cell-tiangan,
  .cell-tiangan-tianpan {
    font-size: 12px;
  }
  
  .changsheng-dizhi {
    font-size: 9px;
    margin-left: 1px;
  }
  
  .changsheng-state {
    font-size: 8px;
    margin-left: 1px;
    padding: 1px 2px;
  }
  
  .jixiong-ge-section {
    margin: 1px 0;
  }
  
  .jixiong-ge-name {
    font-size: 9px;
  }
  
  .jixiong-label {
    font-size: 7px;
    padding: 1px 3px;
  }
  
  .wuxing-label {
    font-size: 8px;
    margin-left: 1px;
    padding: 1px 2px;
  }
  
  .cell-bamen,
  .cell-bamen-tianpan,
  .cell-jiuxing,
  .cell-jiuxing-dipan,
  .cell-jiuxing-tianpan {
    font-size: 9px;
  }
  
  .cell-dizhi-dipan {
    font-size: 8px;
    gap: 1px;
    margin: 1px 0;
  }
  
  .kongwang-label {
    font-size: 7px;
    padding: 1px 2px;
    margin-left: 1px;
  }
  
  .cell-bashen {
    font-size: 9px;
    top: 2px;
    right: 2px;
  }
  
  .info-label {
    font-size: 7px;
  }
}

/* 复制提示样式 */
.copy-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}
</style>

