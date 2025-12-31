<template>
  <div class="rules">
    <h3>十干克应吉凶格全图</h3>
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
        </tbody>
      </table>
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
</style>

