<template>
  <div class="rules">
    <h3>十干克应吉凶格全图</h3>
    <div class="statistics">
      <span class="stat-item stat-good">吉：16个</span>
      <span class="stat-item stat-medium">中：14个</span>
      <span class="stat-item stat-bad">凶：51个</span>
      <span class="stat-item stat-total">总计：81个</span>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>天盘</th>
            <th>地盘</th>
            <th>吉凶格</th>
            <th>性质</th>
            <th>代表含义</th>
          </tr>
        </thead>
        <tbody>
          <!-- 天盘戊 -->
          <tr><td>戊</td><td>戊</td><td>伏吟</td><td class="bad">凶</td><td>本地、内部、推迟，以守为主</td></tr>
          <tr><td>戊</td><td>乙</td><td>青龙和会</td><td class="medium">中</td><td>门吉事吉，门凶事凶</td></tr>
          <tr><td>戊</td><td>丙</td><td>龙回首</td><td class="good">吉</td><td>第一吉格，大吉大利，凶事遇门迫、入墓、击刑则不利</td></tr>
          <tr><td>戊</td><td>丁</td><td>青龙腾明</td><td class="good">吉</td><td>第三吉格，利于见贵人、求取功名，遇门迫、入墓不利</td></tr>
          <tr><td>戊</td><td>己</td><td>贵人入狱</td><td class="bad">凶</td><td>于公私均不利，冲墓之时有转机</td></tr>
          <tr><td>戊</td><td>庚</td><td>值符飞宫</td><td class="bad">凶</td><td>好事不成，凶事更凶，值符飞离此宫，主换人、换地方</td></tr>
          <tr><td>戊</td><td>辛</td><td>青龙折足</td><td class="medium">中</td><td>吉门生助可谋事，凶门主招灾失财、足疾、折伤</td></tr>
          <tr><td>戊</td><td>壬</td><td>青龙入天牢</td><td class="bad">凶</td><td>公私皆不利</td></tr>
          <tr><td>戊</td><td>癸</td><td>青龙华盖</td><td class="medium">中</td><td>门吉则事吉，门凶则事凶</td></tr>
          <!-- 天盘乙 -->
          <tr><td>乙</td><td>戊</td><td>阴害阳门</td><td class="medium">中</td><td>利于阴人阴事，不利阳人阳事，吉凶看门</td></tr>
          <tr><td>乙</td><td>乙</td><td>日奇伏吟</td><td class="bad">凶</td><td>宜静不宜动，宜守不宜攻</td></tr>
          <tr><td>乙</td><td>丙</td><td>奇仪顺遂</td><td class="good">吉</td><td>乙奇临吉凶，本质好，升职顺遂；临凶星，与第三方男子苟合，婚变</td></tr>
          <tr><td>乙</td><td>丁</td><td>奇仪相佐</td><td class="good">吉</td><td>利文书、考试，百事可为</td></tr>
          <tr><td>乙</td><td>己</td><td>日奇入墓</td><td class="medium">中</td><td>门吉有救，门凶事凶。遇开门为地遁吉格</td></tr>
          <tr><td>乙</td><td>庚</td><td>日奇被刑</td><td class="bad">凶</td><td>夫妻不和，争讼财产</td></tr>
          <tr><td>乙</td><td>辛</td><td>龙逃走</td><td class="bad">凶</td><td>家破人亡，财散人走。婚姻主女方提离婚，离开男方</td></tr>
          <tr><td>乙</td><td>壬</td><td>日奇入天罗</td><td class="bad">凶</td><td>尊卑悖乱，官讼是非，有人谋害</td></tr>
          <tr><td>乙</td><td>癸</td><td>日奇入地罗</td><td class="bad">凶</td><td>宜退不宜进，躲灾避难为吉</td></tr>
          <!-- 天盘丙 -->
          <tr><td>丙</td><td>戊</td><td>鸟跌穴</td><td class="good">吉</td><td>第二吉格，大吉大利，凶事遇门迫、入墓、击刑则不利</td></tr>
          <tr><td>丙</td><td>乙</td><td>日月并行</td><td class="good">吉</td><td>公私皆有利</td></tr>
          <tr><td>丙</td><td>丙</td><td>月奇悖师</td><td class="bad">凶</td><td>文书逼迫，破耗遗失</td></tr>
          <tr><td>丙</td><td>丁</td><td>星奇朱雀</td><td class="good">吉</td><td>贵人文书吉利，常人平安喜乐，遇开生休吉门为天遁吉格</td></tr>
          <tr><td>丙</td><td>己</td><td>火悖入刑</td><td class="bad">凶</td><td>门吉得吉，门凶得凶。主囚人刑仗，文书不行</td></tr>
          <tr><td>丙</td><td>庚</td><td>萤入太白</td><td class="bad">凶</td><td>谋求好事大凶，主门户破败，盗贼横行，事业难成。"贼退格"，测贼退为吉</td></tr>
          <tr><td>丙</td><td>辛</td><td>月奇相合</td><td class="good">吉</td><td>测事可成，测病亦不为凶</td></tr>
          <tr><td>丙</td><td>壬</td><td>火入天罗</td><td class="bad">凶</td><td>为客不利，是非颇多</td></tr>
          <tr><td>丙</td><td>癸</td><td>月奇地网</td><td class="bad">凶</td><td>暗昧不明，容易有小人、阴人害事，招灾祸</td></tr>
          <!-- 天盘丁 -->
          <tr><td>丁</td><td>戊</td><td>青龙转光</td><td class="good">吉</td><td>第四吉格，好事更加顺利，遇门迫、入墓不利</td></tr>
          <tr><td>丁</td><td>乙</td><td>玉女奇生</td><td class="good">吉</td><td>贵人加官晋爵，常人婚姻财帛有喜</td></tr>
          <tr><td>丁</td><td>丙</td><td>星随月转</td><td class="medium">中</td><td>贵人越级高开，发展顺遂；常人阴阳颠倒，乐极生悲，造成不幸</td></tr>
          <tr><td>丁</td><td>丁</td><td>星奇伏吟</td><td class="good">吉</td><td>文书、证件即至，喜事从心</td></tr>
          <tr><td>丁</td><td>己</td><td>火入勾陈</td><td class="bad">凶</td><td>主阴私之事，谋事不利，奸私仇冤，或事因女人</td></tr>
          <tr><td>丁</td><td>庚</td><td>星奇受阻</td><td class="bad">凶</td><td>文书阻隔，消息不同，测外出之人则归</td></tr>
          <tr><td>丁</td><td>辛</td><td>朱雀入狱</td><td class="medium">中</td><td>地盘为罪人释放，天盘为官人失位</td></tr>
          <tr><td>丁</td><td>壬</td><td>奇仪相合</td><td class="good">吉</td><td>凡事有成，贵人辅助，讼狱公平。婚姻主苟合关系</td></tr>
          <tr><td>丁</td><td>癸</td><td>雀投江</td><td class="bad">凶</td><td>文书口舌是非，词讼不利，音信全无</td></tr>
          <!-- 天盘己 -->
          <tr><td>己</td><td>戊</td><td>犬遇青龙</td><td class="medium">中</td><td>门吉则事吉，门凶则事不成</td></tr>
          <tr><td>己</td><td>乙</td><td>地户逢星</td><td class="bad">凶</td><td>宜遁迹隐形，宜退不宜进</td></tr>
          <tr><td>己</td><td>丙</td><td>火悖地户</td><td class="bad">凶</td><td>男人冤冤相害，女人遭人奸污</td></tr>
          <tr><td>己</td><td>丁</td><td>地户朱雀</td><td class="good">吉</td><td>文书词讼，先曲后直，先凶后吉</td></tr>
          <tr><td>己</td><td>己</td><td>地户逢鬼</td><td class="bad">凶</td><td>疾病、发凶或必死，好事不成，谋为则凶</td></tr>
          <tr><td>己</td><td>庚</td><td>刑格反名</td><td class="bad">凶</td><td>不宜谋事，词讼先动者不利，阴星则有谋害的可能</td></tr>
          <tr><td>己</td><td>辛</td><td>游魂入墓</td><td class="bad">凶</td><td>鬼魅作祟，小心谨慎</td></tr>
          <tr><td>己</td><td>壬</td><td>地网高张</td><td class="bad">凶</td><td>谋为不利，凡事不吉，容易出狡童佚女，奸情伤杀之事</td></tr>
          <tr><td>己</td><td>癸</td><td>地刑玄武</td><td class="bad">凶</td><td>男女疾病垂危，囚狱词讼之灾</td></tr>
          <!-- 天盘庚 -->
          <tr><td>庚</td><td>戊</td><td>值符伏宫</td><td class="bad">凶</td><td>大凶，主换人、换地方，但庚为用神另当别论</td></tr>
          <tr><td>庚</td><td>乙</td><td>太白逢星</td><td class="bad">凶</td><td>宜退不宜进，对客有利，对主不利</td></tr>
          <tr><td>庚</td><td>丙</td><td>白入萤</td><td class="bad">凶</td><td>"贼来格"，占贼必来，以固守为好。若日干为庚或年命为庚为吉，主动出击，先发制人，就会利于自己</td></tr>
          <tr><td>庚</td><td>丁</td><td>金屋藏娇</td><td class="medium">中</td><td>男女关系所引起的官讼是非。门吉则事吉，门凶则事凶</td></tr>
          <tr><td>庚</td><td>己</td><td>官府刑格</td><td class="bad">凶</td><td>官司是非，判刑，牢狱之灾等</td></tr>
          <tr><td>庚</td><td>庚</td><td>太白同宫、战格</td><td class="bad">凶</td><td>不利谋事，不和，招来官灾横祸</td></tr>
          <tr><td>庚</td><td>辛</td><td>白虎干格、太白刑格</td><td class="bad">凶</td><td>远行不利，诸事有灾</td></tr>
          <tr><td>庚</td><td>壬</td><td>小格、上格</td><td class="bad">凶</td><td>远行迷失，音信全无。若庚为用神，主变动、变化，为"移荡格"</td></tr>
          <tr><td>庚</td><td>癸</td><td>大格</td><td class="bad">凶</td><td>主车祸，行人不至，官讼不息，母子俱伤</td></tr>
          <!-- 天盘辛 -->
          <tr><td>辛</td><td>戊</td><td>困龙被伤</td><td class="bad">凶</td><td>妄动财失伤灾，辛为用神反为吉，但子午冲，有失财的风险。</td></tr>
          <tr><td>辛</td><td>乙</td><td>虎猖狂</td><td class="bad">凶</td><td>家破人亡，远行有灾。婚姻主男方提离婚，拆散家庭</td></tr>
          <tr><td>辛</td><td>丙</td><td>干合悖师</td><td class="medium">中</td><td>门吉事吉，门凶事凶。合作求财，会因财致讼</td></tr>
          <tr><td>辛</td><td>丁</td><td>狱神得奇</td><td class="good">吉</td><td>经商求财利润丰厚，做事有意外收获。赦免处分等</td></tr>
          <tr><td>辛</td><td>己</td><td>入狱自刑</td><td class="bad">凶</td><td>错误由自身造成，女仆背主，诉讼难伸</td></tr>
          <tr><td>辛</td><td>庚</td><td>白虎出力、天狱自刑</td><td class="bad">凶</td><td>主客相残，不可强进</td></tr>
          <tr><td>辛</td><td>辛</td><td>伏吟天庭</td><td class="bad">凶</td><td>为事自破，进退不果，讼狱，公废私就</td></tr>
          <tr><td>辛</td><td>壬</td><td>凶蛇入狱</td><td class="bad">凶</td><td>争讼不息，先动失理</td></tr>
          <tr><td>辛</td><td>癸</td><td>天牢华盖、虎投地网</td><td class="bad">凶</td><td>日月失明，误入地网，动止乖张</td></tr>
          <!-- 天盘壬 -->
          <tr><td>壬</td><td>戊</td><td>小蛇化龙</td><td class="good">吉</td><td>男主事业发达，女主产婴童</td></tr>
          <tr><td>壬</td><td>乙</td><td>小蛇得势</td><td class="good">吉</td><td>男人发达，有工作俸禄地位；女人柔顺，怀孕可得儿子</td></tr>
          <tr><td>壬</td><td>丙</td><td>水蛇入火</td><td class="bad">凶</td><td>官灾刑禁，络绎不绝，两败俱伤</td></tr>
          <tr><td>壬</td><td>丁</td><td>干合蛇刑</td><td class="medium">中</td><td>文书牵连，贵人匆匆，男吉女凶。天盘，壬为男，遇丁奇为吉；地盘，丁为女，上有天罗为凶</td></tr>
          <tr><td>壬</td><td>己</td><td>反吟蛇刑</td><td class="bad">凶</td><td>官司败诉，大祸将至，顺守可吉，妄动必凶</td></tr>
          <tr><td>壬</td><td>庚</td><td>太白擒蛇</td><td class="medium">中</td><td>事情难以进展，如测词讼，主刑狱公平，立判邪正</td></tr>
          <tr><td>壬</td><td>辛</td><td>腾蛇相缠</td><td class="bad">凶</td><td>吉门也不得安宁，谋望被人欺骗</td></tr>
          <tr><td>壬</td><td>壬</td><td>天狱自刑、蛇入地罗</td><td class="bad">凶</td><td>谋事无成，内事索索，外入缠绕，诸事破败，灾祸起于内部。吉门吉星，尚可缓解</td></tr>
          <tr><td>壬</td><td>癸</td><td>天罗逢地网、幼女奸淫</td><td class="bad">凶</td><td>诸事不利。阴阳交合，暧昧不明，家丑外扬。门吉为风流男女，门凶为本质坏，男女之事招灾</td></tr>
          <!-- 天盘癸 -->
          <tr><td>癸</td><td>戊</td><td>天乙会合</td><td class="medium">中</td><td>门吉则事吉，门凶则事凶</td></tr>
          <tr><td>癸</td><td>乙</td><td>华盖逢星</td><td class="medium">中</td><td>吉门主贵人禄位、常人平安；凶门则凶上加凶；癸为用神则为吉</td></tr>
          <tr><td>癸</td><td>丙</td><td>华盖悖师</td><td class="bad">凶</td><td>诸事不利。只有修为高超、能屈能生、因势利导的人才能变不利为有利</td></tr>
          <tr><td>癸</td><td>丁</td><td>蛇夭矫</td><td class="bad">凶</td><td>官司诉讼，火焚也逃不掉</td></tr>
          <tr><td>癸</td><td>己</td><td>华盖地户</td><td class="bad">凶</td><td>男女音信皆阻，躲灾避难为吉</td></tr>
          <tr><td>癸</td><td>庚</td><td>太白入网</td><td class="bad">凶</td><td>凡事无成，吉事易空，暴力争讼，自身获罪</td></tr>
          <tr><td>癸</td><td>辛</td><td>网盖天牢</td><td class="bad">凶</td><td>官司败诉，死罪难逃，占病为凶</td></tr>
          <tr><td>癸</td><td>壬</td><td>复见腾蛇</td><td class="bad">凶</td><td>婚姻重婚，婚后无子，不保年华。事物变化，或另找主人，另寻合作伙伴</td></tr>
          <tr><td>癸</td><td>癸</td><td>天网四张</td><td class="bad">凶</td><td>伏吟格，行人失伴，病讼皆伤</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 十二长生 -->
    <div class="section-wrapper">
      <div class="section-content">
        <h4>十二长生</h4>
        <div class="changsheng-table-container">
          <table class="changsheng-table">
            <thead>
              <tr>
                <th>运程阶段</th>
                <th>甲木</th>
                <th>丙火</th>
                <th>戊土</th>
                <th>庚金</th>
                <th>壬水</th>
                <th>乙木</th>
                <th>丁火</th>
                <th>己土</th>
                <th>辛金</th>
                <th>癸水</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(stage, index) in changShengStages" :key="index">
                <td class="stage-name">{{ stage.name }}</td>
                <td>{{ stage['甲木'] }}</td>
                <td>{{ stage['丙火'] }}</td>
                <td>{{ stage['戊土'] }}</td>
                <td>{{ stage['庚金'] }}</td>
                <td>{{ stage['壬水'] }}</td>
                <td>{{ stage['乙木'] }}</td>
                <td>{{ stage['丁火'] }}</td>
                <td>{{ stage['己土'] }}</td>
                <td>{{ stage['辛金'] }}</td>
                <td>{{ stage['癸水'] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 五行相生相克 -->
    <div class="section-wrapper">
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
  </div>
</template>

<script>
export default {
  name: 'PanRules',
  computed: {
    changShengStages() {
      return [
        { name: '长生', '甲木': '亥', '丙火': '寅', '戊土': '寅', '庚金': '巳', '壬水': '申', '乙木': '午', '丁火': '酉', '己土': '酉', '辛金': '子', '癸水': '卯' },
        { name: '沐浴', '甲木': '子', '丙火': '卯', '戊土': '卯', '庚金': '午', '壬水': '酉', '乙木': '巳', '丁火': '申', '己土': '申', '辛金': '亥', '癸水': '寅' },
        { name: '冠带', '甲木': '丑', '丙火': '辰', '戊土': '辰', '庚金': '未', '壬水': '戌', '乙木': '辰', '丁火': '未', '己土': '未', '辛金': '戌', '癸水': '丑' },
        { name: '临官', '甲木': '寅', '丙火': '巳', '戊土': '巳', '庚金': '申', '壬水': '亥', '乙木': '卯', '丁火': '午', '己土': '午', '辛金': '酉', '癸水': '子' },
        { name: '帝旺', '甲木': '卯', '丙火': '午', '戊土': '午', '庚金': '酉', '壬水': '子', '乙木': '寅', '丁火': '巳', '己土': '巳', '辛金': '申', '癸水': '亥' },
        { name: '衰', '甲木': '辰', '丙火': '未', '戊土': '未', '庚金': '戌', '壬水': '丑', '乙木': '丑', '丁火': '辰', '己土': '辰', '辛金': '未', '癸水': '戌' },
        { name: '病', '甲木': '巳', '丙火': '申', '戊土': '申', '庚金': '亥', '壬水': '寅', '乙木': '子', '丁火': '卯', '己土': '卯', '辛金': '午', '癸水': '酉' },
        { name: '死', '甲木': '午', '丙火': '酉', '戊土': '酉', '庚金': '子', '壬水': '卯', '乙木': '亥', '丁火': '寅', '己土': '寅', '辛金': '巳', '癸水': '申' },
        { name: '墓', '甲木': '未', '丙火': '戌', '戊土': '戌', '庚金': '丑', '壬水': '辰', '乙木': '戌', '丁火': '丑', '己土': '丑', '辛金': '辰', '癸水': '未' },
        { name: '绝', '甲木': '申', '丙火': '亥', '戊土': '亥', '庚金': '寅', '壬水': '巳', '乙木': '酉', '丁火': '子', '己土': '子', '辛金': '卯', '癸水': '午' },
        { name: '胎', '甲木': '酉', '丙火': '子', '戊土': '子', '庚金': '卯', '壬水': '午', '乙木': '申', '丁火': '亥', '己土': '亥', '辛金': '寅', '癸水': '巳' },
        { name: '养', '甲木': '戌', '丙火': '丑', '戊土': '丑', '庚金': '辰', '壬水': '未', '乙木': '未', '丁火': '戌', '己土': '戌', '辛金': '丑', '癸水': '辰' }
      ];
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
  }
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

.statistics {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.stat-item {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
}

.stat-good {
  color: #67c23a;
  background-color: #f0f9ff;
}

.stat-medium {
  color: #e6a23c;
  background-color: #fef0e6;
}

.stat-bad {
  color: #f56c6c;
  background-color: #fef0f0;
}

.stat-total {
  color: #333;
  background-color: #f5f7fa;
  margin-left: auto;
}

.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table thead {
  background-color: #409eff;
  color: #fff;
}

.data-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  color: #333;
}

.data-table tbody tr:hover {
  background-color: #f5f7fa;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table .good {
  color: #67c23a;
  font-weight: 600;
}

.data-table .bad {
  color: #f56c6c;
  font-weight: 600;
}

.data-table .medium {
  color: #e6a23c;
  font-weight: 600;
}

.section-wrapper {
  margin-top: 30px;
}

.section-content {
  background-color: #fff;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-content h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
}

.changsheng-table-container {
  overflow-x: auto;
  margin-top: 15px;
}

.changsheng-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 13px;
}

.changsheng-table thead {
  background-color: #409eff;
  color: #fff;
}

.changsheng-table th {
  padding: 10px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.changsheng-table th:last-child {
  border-right: none;
}

.changsheng-table td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
  color: #333;
}

.changsheng-table td:last-child {
  border-right: none;
}

.changsheng-table tbody tr:hover {
  background-color: #f5f7fa;
}

.changsheng-table tbody tr:last-child td {
  border-bottom: none;
}

.changsheng-table .stage-name {
  background-color: #f0f9ff;
  color: #409eff;
  font-weight: 600;
}

.wuxing-relation-content {
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
</style>

