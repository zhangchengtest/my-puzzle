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
                    <span class="position-label">八卦</span>
                  </div>
                  <div class="cell-tiangan">
                    <span>{{ cell.tiangan }}</span>
                    <span class="info-label">天干</span>
                  </div>
                  <div class="cell-dizhi">
                    <span>{{ cell.dizhi }}</span>
                    <span class="info-label">地支</span>
                  </div>
                  <div class="cell-bamen">
                    <span>{{ cell.bamen }}</span>
                    <span class="info-label">门</span>
                  </div>
                  <div class="cell-jiuxing">
                    <span>{{ cell.jiuxing }}</span>
                    <span class="info-label">星</span>
                  </div>
                  <div class="cell-bashen" v-if="cell.bashen">
                    <span>{{ cell.bashen }}</span>
                    <span class="info-label">神</span>
                  </div>
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
                <h4>排盘方法</h4>
                <div class="rule-content">
                  <p><strong>时家奇门：</strong>以时辰为主进行排盘，每个时辰一个盘。</p>
                  <p><strong>茅山法：</strong>根据日干支和节气确定局数的方法。</p>
                </div>
              </div>
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
                <h4>二、茅山法确定局数</h4>
                <div class="rule-content">
                  <p><strong>1. 确定阴阳遁：</strong></p>
                  <ul>
                    <li>冬至后到夏至前为<strong>阳遁</strong></li>
                    <li>夏至后到冬至前为<strong>阴遁</strong></li>
                  </ul>
                  
                  <p><strong>2. 根据日干支确定上中下元：</strong></p>
                  <ul>
                    <li><strong>上元：</strong>甲子、己卯、甲午、己酉</li>
                    <li><strong>中元：</strong>甲戌、己丑、甲辰、己未</li>
                    <li><strong>下元：</strong>甲申、己亥、甲寅、己巳</li>
                  </ul>
                  
                  <p><strong>3. 确定局数：</strong></p>
                  <ul>
                    <li><strong>阳遁：</strong>上元1局、中元4局、下元7局</li>
                    <li><strong>阴遁：</strong>上元9局、中元6局、下元3局</li>
                  </ul>
                  
                  <p><strong>4. 非甲己日的推算：</strong></p>
                  <p>如果不是甲己日，需要根据节气推算所属的元，每5天一个循环，每15天一个元。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>三、阴阳遁局数和九宫顺序的关系</h4>
                <div class="rule-content">
                  <p><strong>1. 九宫顺序：</strong></p>
                  <p>九宫按照洛书顺序排列：坎1宫 → 坤2宫 → 震3宫 → 巽4宫 → 中5宫 → 乾6宫 → 兑7宫 → 艮8宫 → 离9宫</p>
                  
                  <p><strong>2. 阳遁局数和九宫的关系：</strong></p>
                  <ul>
                    <li><strong>阳遁1局：</strong>戊在坎1宫，己在坤2宫，庚在震3宫，辛在巽4宫，壬在中5宫，癸在乾6宫，丁在兑7宫，丙在艮8宫，乙在离9宫</li>
                    <li><strong>阳遁2局：</strong>戊在坤2宫，己在震3宫，庚在巽4宫，辛在中5宫，壬在乾6宫，癸在兑7宫，丁在艮8宫，丙在离9宫，乙在坎1宫</li>
                    <li><strong>阳遁3局：</strong>戊在震3宫，己在巽4宫，庚在中5宫，辛在乾6宫，壬在兑7宫，癸在艮8宫，丁在离9宫，丙在坎1宫，乙在坤2宫</li>
                    <li><strong>规律：</strong>阳遁从局数对应的宫位开始，六仪三奇按照九宫顺序<strong>顺行</strong>排布</li>
                    <li>例如：阳遁1局，戊在1宫（坎），然后顺行到2宫（坤）、3宫（震）...</li>
                    <li>阳遁2局，戊在2宫（坤），然后顺行到3宫（震）、4宫（巽）...</li>
                  </ul>
                  
                  <p><strong>3. 阴遁局数和九宫的关系：</strong></p>
                  <ul>
                    <li><strong>阴遁1局：</strong>戊在坎1宫，己在离9宫，庚在艮8宫，辛在兑7宫，壬在乾6宫，癸在中5宫，丁在巽4宫，丙在震3宫，乙在坤2宫</li>
                    <li><strong>阴遁2局：</strong>戊在坤2宫，己在坎1宫，庚在离9宫，辛在艮8宫，壬在兑7宫，癸在乾6宫，丁在中5宫，丙在巽4宫，乙在震3宫</li>
                    <li><strong>阴遁3局：</strong>戊在震3宫，己在坤2宫，庚在坎1宫，辛在离9宫，壬在艮8宫，癸在兑7宫，丁在乾6宫，丙在中5宫，乙在巽4宫</li>
                    <li><strong>规律：</strong>阴遁从局数对应的宫位开始，六仪三奇按照九宫顺序<strong>逆行</strong>排布</li>
                    <li>例如：阴遁1局，戊在1宫（坎），然后逆行到9宫（离）、8宫（艮）...</li>
                    <li>阴遁2局，戊在2宫（坤），然后逆行到1宫（坎）、9宫（离）...</li>
                  </ul>
                  
                  <p><strong>4. 六仪三奇的排布顺序：</strong></p>
                  <ul>
                    <li><strong>六仪顺序：</strong>戊、己、庚、辛、壬、癸（甲隐藏于其中）</li>
                    <li><strong>三奇顺序：</strong>乙、丙、丁</li>
                    <li><strong>完整顺序：</strong>戊、己、庚、辛、壬、癸、丁、丙、乙</li>
                    <li>这个顺序在阳遁和阴遁中都相同，只是排布方向不同</li>
                  </ul>
                  
                  <p><strong>5. 中5宫的处理：</strong></p>
                  <ul>
                    <li>中5宫（中宫）在排布中特殊处理</li>
                    <li>阳遁：中5宫在顺行序列中正常排布</li>
                    <li>阴遁：中5宫在逆行序列中正常排布</li>
                    <li>中5宫的本位星是天禽星</li>
                  </ul>
                  
                  <p><strong>6. 局数和起始宫位的对应关系：</strong></p>
                  <ul>
                    <li><strong>阳遁：</strong>局数1-9对应起始宫位1-9</li>
                    <li><strong>阴遁：</strong>局数1-9对应起始宫位1-9</li>
                    <li>例如：阳遁1局，戊从坎1宫开始；阳遁5局，戊从中5宫开始</li>
                    <li>例如：阴遁1局，戊从坎1宫开始；阴遁5局，戊从中5宫开始</li>
                  </ul>
                </div>
              </div>

              <div class="rule-section">
                <h4>四、天干地支排布规则</h4>
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
                  <p><strong>值符的确定过程（奇门遁甲排盘的关键步骤）：</strong></p>
                  <ol>
                    <li><strong>确定旬首：</strong>
                      <p>根据预测时辰的天干地支找出对应的旬首。六十甲子中，旬首固定为：</p>
                      <ul>
                        <li>甲子旬（对应六仪：戊）</li>
                        <li>甲戌旬（对应六仪：己）</li>
                        <li>甲申旬（对应六仪：庚）</li>
                        <li>甲午旬（对应六仪：辛）</li>
                        <li>甲辰旬（对应六仪：壬）</li>
                        <li>甲寅旬（对应六仪：癸）</li>
                      </ul>
                      <p>例如：时辰为甲午辛时，属于甲午辛旬，旬首即为甲午。</p>
                    </li>
                    <li><strong>定位旬首所遁六仪的落宫：</strong>
                      <p>根据旬首确定其在地盘九宫中的位置。需要先依据节气判断阴阳遁局数（如阳遁一局或阴遁九局），再按九宫顺序（坎一宫至兑九宫）顺数或逆数排列六仪。</p>
                      <p>例如：旬首甲午在阳遁一局中可能落于坎一宫。</p>
                    </li>
                    <li><strong>确定值符九星：</strong>
                      <p>值符即为旬首所遁六仪所在宫位对应的本位九星。各宫位的本位星：</p>
                      <ul>
                        <li>坎一宫：天蓬星</li>
                        <li>坤二宫：天芮星</li>
                        <li>震三宫：天冲星</li>
                        <li>巽四宫：天辅星</li>
                        <li>中五宫：天禽星</li>
                        <li>乾六宫：天心星</li>
                        <li>兑七宫：天柱星</li>
                        <li>艮八宫：天任星</li>
                        <li>离九宫：天英星</li>
                      </ul>
                      <p>例如：坎一宫的本位星为天蓬星，则值符为天蓬星；若落中五宫，则取天禽星为值符。</p>
                    </li>
                    <li><strong>值符随时干落宫：</strong>
                      <p>值符的最终落宫由时干决定，即值符跟随时干所在的宫位。</p>
                      <p>例如：时干辛落坎一宫，则值符（如天蓬星）及其携带的六仪（辛）进入坎一宫，形成天盘布局。</p>
                    </li>
                  </ol>
                  <p><strong>值使的确定过程：</strong></p>
                  <ol>
                    <li>值使是当值的八门</li>
                    <li>值使门根据时辰确定，与值符的确定方法相同</li>
                    <li>值使门跟随值符转动，在值符所在宫位</li>
                  </ol>
                  <p><strong>总结：</strong></p>
                  <ul>
                    <li>值符的确定是奇门遁甲排盘的关键步骤</li>
                    <li>值符确定后，值符星和值使门都跟随值符所在宫位</li>
                    <li>值符所在宫位是当前最重要的方位</li>
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
                <h4>五、八门</h4>
                <div class="rule-content">
                  <p>八门：休、生、伤、杜、景、死、惊、开</p>
                  <p>八门按照固定的顺序排布在九宫格中，值使门根据时辰确定。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>六、九星</h4>
                <div class="rule-content">
                  <p>九星：天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英</p>
                  <p>九星按照固定的顺序排布，值符星根据时辰确定。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>七、八神</h4>
                <div class="rule-content">
                  <p>八神：值符、腾蛇、太阴、六合、白虎、玄武、九地、九天</p>
                  <p>八神按照时辰和值符位置排布，值符在值符星所在宫位。</p>
                </div>
              </div>

              <div class="rule-section">
                <h4>八、时辰对应</h4>
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
      
      // 计算日干支（用于茅山法确定局数）
      const dayGanZhi = this.getDayGanZhi(year, month, day);
      
      // 计算节气（显示上一个和上上一个节气）
      const solarTerm = this.getRecentSolarTerms(year, month, day);
      
      // 计算局数（茅山法）
      const juResult = this.calculateJuNumberByMaoshan(year, month, day, dayGanZhi);
      const juNumber = juResult.juNumber;
      const dunType = juResult.dunType; // 阳遁或阴遁
      const yuanType = juResult.yuanType; // 上元、中元、下元
      
      // 获取当前所属的节气名称和元
      const currentYuan = this.getCurrentYuan(year, month, day, yuanType);
      
      // 计算时干支（用于确定值符）
      const timeGanZhi = this.getTimeGanZhi(year, month, day, hour);
      
      // 确定旬首
      const xunShouInfo = this.getXunShou(timeGanZhi);
      const xunShou = `${xunShouInfo.ganZhi}（${xunShouInfo.liuYi}）`;
      
      // 生成九宫格数据
      const grid = this.generateGrid(juNumber, hour, timeGanZhi, dunType);
      
      this.panData = {
        solarDate: `${year}年${month}月${day}日 ${hour}时`,
        lunarDate: lunarDate,
        timeBranch: timeBranch,
        timeGanZhi: timeGanZhi,
        xunShou: xunShou,
        solarTerm: solarTerm,
        currentYuan: currentYuan,
        dayGanZhi: dayGanZhi,
        juNumber: juNumber,
        dunType: dunType,
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
    calculateJuNumberByMaoshan(year, month, day, dayGanZhi) {
      // 判断是阳遁还是阴遁（根据节气）
      const solarTerm = this.getSolarTerm(year, month, day);
      const isYangDun = solarTerm >= 0 && solarTerm <= 5; // 阳遁：冬至后到夏至前
      
      // 茅山法：根据日干支确定局数
      // 阳遁上元：甲子、己卯、甲午、己酉 → 1局
      // 阳遁中元：甲戌、己丑、甲辰、己未 → 4局
      // 阳遁下元：甲申、己亥、甲寅、己巳 → 7局
      // 阴遁上元：甲子、己卯、甲午、己酉 → 9局
      // 阴遁中元：甲戌、己丑、甲辰、己未 → 6局
      // 阴遁下元：甲申、己亥、甲寅、己巳 → 3局
      
      const gan = dayGanZhi[0];
      const zhi = dayGanZhi[1];
      
      // 判断是上元、中元还是下元（茅山法）
      let yuanType = ''; // 上元、中元、下元
      
      const zhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(zhi);
      
      // 茅山法：根据日干支确定元
      // 上元：甲子、己卯、甲午、己酉（子、卯、午、酉，索引0,3,6,9）
      // 中元：甲戌、己丑、甲辰、己未（戌、丑、辰、未，索引10,1,4,7）
      // 下元：甲申、己亥、甲寅、己巳（申、亥、寅、巳，索引8,11,2,5）
      
      if (gan === '甲' || gan === '己') {
        // 甲己日直接判断
        if ([0, 3, 6, 9].includes(zhiIndex)) {
          yuanType = '上元';
        } else if ([10, 1, 4, 7].includes(zhiIndex)) {
          yuanType = '中元';
        } else if ([8, 11, 2, 5].includes(zhiIndex)) {
          yuanType = '下元';
        }
      } else {
        // 非甲己日，需要找到最近的甲己日（向前找）
        // 计算距离上一个甲己日的天数
        const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(gan);
        let daysToJiaJi = ganIndex % 5;
        if (daysToJiaJi === 0) {
          // 这种情况不应该出现（因为上面已经判断了甲己日）
          // 但作为备用，向前找5天
          daysToJiaJi = 5;
        }
        
        // 推算上一个甲己日的地支（向前推算daysToJiaJi天）
        // 天干每5天循环一次，地支每12天循环一次
        let prevZhiIndex = (zhiIndex - daysToJiaJi + 12) % 12;
        
        // 根据推算出的甲己日地支确定元
        if ([0, 3, 6, 9].includes(prevZhiIndex)) {
          yuanType = '上元';
        } else if ([10, 1, 4, 7].includes(prevZhiIndex)) {
          yuanType = '中元';
        } else if ([8, 11, 2, 5].includes(prevZhiIndex)) {
          yuanType = '下元';
        }
      }
      
      // 如果还是无法确定，使用简化方法（根据节气内的位置）
      // 每个节气15天，分为上中下三元，每元5天
      if (!yuanType) {
        // 简化：根据当前日期在节气内的位置推算
        // 这里需要知道当前是哪个节气，简化处理：根据月份和日期推算
        const dayOfYear = this.getDayOfYear(year, month, day);
        // 每个节气大约15天，简化处理
        const cycleDay = dayOfYear % 15;
        if (cycleDay < 5) yuanType = '上元';
        else if (cycleDay < 10) yuanType = '中元';
        else yuanType = '下元';
      }
      
      // 根据元类型和阴阳遁确定局数
      let juNumber;
      if (isYangDun) {
        // 阳遁
        if (yuanType === '上元') juNumber = 1;
        else if (yuanType === '中元') juNumber = 4;
        else juNumber = 7;
      } else {
        // 阴遁
        if (yuanType === '上元') juNumber = 9;
        else if (yuanType === '中元') juNumber = 6;
        else juNumber = 3;
      }
      
      return {
        juNumber: juNumber,
        dunType: isYangDun ? '阳遁' : '阴遁',
        yuanType: yuanType
      };
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
      // 24节气的顺序和大致日期（简化版，实际应该精确计算）
      // 格式：{name: '节气名', month: 月份, day: 日期}
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
      
      // 将当前日期转换为一年中的天数，方便比较
      const currentDayOfYear = this.getDayOfYear(year, month, day);
      
      // 将所有节气转换为相对于当前日期的天数差
      const currentDate = new Date(year, month - 1, day);
      const termsWithDayOfYear = allTerms.map(term => {
        // 计算节气的日期
        let termDate = new Date(year, term.month - 1, term.day);
        
        // 处理跨年：如果当前是1月，12月的节气算作去年的
        if (month === 1 && term.month === 12) {
          termDate = new Date(year - 1, term.month - 1, term.day);
        }
        // 处理跨年：如果当前是12月，1月的节气（小寒、大寒）算作下一年的
        if (month === 12 && term.month === 1) {
          termDate = new Date(year + 1, term.month - 1, term.day);
        }
        
        // 计算天数差（负数表示已过去）
        const daysDiff = Math.floor((termDate - currentDate) / 86400000);
        
        return {
          ...term,
          date: termDate,
          daysDiff: daysDiff
        };
      });
      
      // 找到已过去的最近两个节气（daysDiff < 0，且最接近0）
      const pastTerms = termsWithDayOfYear
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
      // 八门
      const baMen = ['休', '死', '伤', '杜', '中', '开', '惊', '生', '景'];
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
      // 阳遁：从局数对应的宫位开始，六仪顺行排布
      // 阴遁：从局数对应的宫位开始，六仪逆行排布
      // 简化：局数1-9对应宫位1-9（中5宫特殊处理）
      let startGong = juNumber;
      if (startGong === 5) startGong = 5; // 中5宫
      
      // 计算旬首六仪在地盘的宫位
      let diPanGong;
      if (isYangDun) {
        // 阳遁：顺行
        diPanGong = ((startGong - 1 + liuYiIndex) % 9) + 1;
        if (diPanGong === 0) diPanGong = 9;
      } else {
        // 阴遁：逆行
        diPanGong = ((startGong - 1 - liuYiIndex + 9) % 9) + 1;
        if (diPanGong === 0) diPanGong = 9;
      }
      
      // 3. 确定值符九星（该宫位的本位星）
      const gongToStar = {
        1: '天蓬', 2: '天芮', 3: '天冲', 4: '天辅', 5: '天禽',
        6: '天心', 7: '天柱', 8: '天任', 9: '天英'
      };
      const zhiFuStar = gongToStar[diPanGong];
      
      // 4. 值符跟随旬首落宫
      // 值符是旬首所遁六仪所在宫位的本位星，值符应该跟随旬首走
      // 旬首的位置就是它所对应的六仪在地盘的宫位（diPanGong）
      const zhiFuPosition = diPanGong;
      
      // 调试信息
      console.log('值符计算详情:', {
        timeGanZhi,
        xunShou: xunShou.ganZhi,
        xunShouLiuYi: xunShou.liuYi,
        juNumber,
        dunType,
        startGong,
        diPanGong,
        zhiFuStar,
        zhiFuPosition
      });
      
      // 六仪三奇的完整顺序：戊、己、庚、辛、壬、癸、丁、丙、乙
      const liuYiSanQiOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
      
      // 计算每个宫位的天干（地盘）
      const getTianganByGong = (gong) => {
        // 九宫顺序：1坎、2坤、3震、4巽、5中、6乾、7兑、8艮、9离
        // 计算该宫位在六仪三奇序列中的索引
        let orderIndex;
        if (isYangDun) {
          // 阳遁：从局数对应的宫位开始，六仪三奇顺行排布
          // 例如：阳遁1局，戊在坎1宫（gong=1），索引0
          orderIndex = ((gong - startGong + 9) % 9);
        } else {
          // 阴遁：从局数对应的宫位开始，六仪三奇逆行排布
          orderIndex = ((startGong - gong + 9) % 9);
        }
        return liuYiSanQiOrder[orderIndex];
      };
      
      const grid = [];
      
      for (let i = 0; i < 9; i++) {
        const pos = positions[i];
        const dizhiOffset = (hour + pos - 1) % 12;
        
        // 计算该宫位的天干（地盘）
        const tiangan = getTianganByGong(pos);
        
        // 确定值符是否在此宫位
        let bashen = null;
        if (pos === zhiFuPosition) {
          bashen = '值符';
        }
        
        grid.push({
          position: pos,
          tiangan: tiangan,
          dizhi: diZhi[dizhiOffset % 12],
          bamen: baMen[i % 9],
          jiuxing: jiuXing[i % 9],
          bashen: bashen
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
  flex-wrap: wrap;
}

.position-number {
  color: #409eff;
  font-weight: bold;
  font-size: 18px;
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
  gap: 4px;
  margin: 3px 0;
  flex-wrap: wrap;
}

.cell-tiangan {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.cell-dizhi {
  font-size: 16px;
  color: #67c23a;
}

.cell-bamen {
  font-size: 14px;
  color: #e6a23c;
}

.cell-jiuxing {
  font-size: 13px;
  color: #909399;
}

.cell-bashen {
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #ddd;
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

