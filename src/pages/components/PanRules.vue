<template>
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
</template>

<script>
export default {
  name: 'PanRules'
}
</script>

<style scoped>
.rules {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
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
</style>

