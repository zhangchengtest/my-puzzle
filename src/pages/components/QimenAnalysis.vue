<template>
  <div class="analysis-section">
    <div class="question-group">
      <label>求测事项：</label>
      <select 
        v-model="question" 
        class="question-select"
      >
        <option value="">请选择求测事项</option>
        <optgroup label="财运相关">
          <option value="求财">求财</option>
          <option value="投资">投资</option>
          <option value="生意">生意</option>
          <option value="交易">交易</option>
          <option value="生意合伙">生意合伙</option>
          <option value="店铺开张">店铺开张</option>
          <option value="索债">索债</option>
          <option value="放债">放债</option>
          <option value="利息">利息</option>
        </optgroup>
        <optgroup label="出行相关">
          <option value="出行经商">出行经商</option>
          <option value="出行吉凶">出行吉凶</option>
          <option value="出行择方">出行择方</option>
        </optgroup>
        <optgroup label="投资理财">
          <option value="股票">股票</option>
          <option value="期货">期货</option>
          <option value="彩票">彩票</option>
          <option value="赌博">赌博</option>
        </optgroup>
        <optgroup label="寻人寻物">
          <option value="寻人">寻人</option>
          <option value="寻物">寻物</option>
          <option value="失物">失物</option>
          <option value="访友">访友</option>
        </optgroup>
        <optgroup label="工作事业">
          <option value="工作">工作</option>
          <option value="事业">事业</option>
          <option value="功名">功名</option>
          <option value="办事">办事</option>
        </optgroup>
        <optgroup label="人际关系">
          <option value="交友">交友</option>
          <option value="请客">请客</option>
        </optgroup>
        <optgroup label="健康疾病">
          <option value="疾病">疾病</option>
          <option value="健康">健康</option>
          <option value="胎孕">胎孕</option>
          <option value="寿命">寿命</option>
        </optgroup>
        <optgroup label="感情婚姻">
          <option value="感情">感情</option>
          <option value="婚姻">婚姻</option>
        </optgroup>
        <optgroup label="诉讼纠纷">
          <option value="词讼">词讼</option>
          <option value="官司">官司</option>
        </optgroup>
        <optgroup label="天气预测">
          <option value="下雨">下雨</option>
          <option value="晴天">晴天</option>
        </optgroup>
        <optgroup label="其他">
          <option value="博弈">博弈</option>
          <option value="捕鱼">捕鱼</option>
        </optgroup>
      </select>
      <button @click="analyzePan" class="btn-analyze" :disabled="!panData || !question">开始分析</button>
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
            <div v-if="item.reference" class="result-reference">
              <strong>参考规则：</strong>
              <span>{{ item.reference }}</span>
            </div>
          </div>
        </div>
        <div class="result-summary">
          <h4>综合建议</h4>
          <p>{{ analysisResult.summary }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QimenAnalysis',
  props: {
    panData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      question: '',
      analysisResult: null
    };
  },
  methods: {
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
        const bamen = cell.bamenTianPan || cell.bamenDiPan;
        if (bamen && goodGates.includes(bamen)) {
          return `${this.getPositionNameByPosition(cell.position)}宫${bamen}门为吉门`;
        } else if (bamen && badGates.includes(bamen)) {
          return `${this.getPositionNameByPosition(cell.position)}宫${bamen}门为凶门`;
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
      const specificAnalysisResult = this.getSpecificAnalysis(grid, questionType);
      
      if (specificAnalysisResult) {
        items.push({
          title: '针对性分析',
          content: specificAnalysisResult.content || specificAnalysisResult,
          reference: specificAnalysisResult.reference || this.getReferenceRule(questionType)
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
    getQuestionType(question) {
      const q = question.toLowerCase();
      // 求财相关
      if (q.includes('求财') || q.includes('赚钱') || q.includes('财运')) {
        return 'qiucai';
      }
      // 出行经商
      if (q.includes('出行') || q.includes('经商') || q.includes('外出做生意')) {
        return 'chuxing';
      }
      // 交易
      if (q.includes('交易') || q.includes('买卖') || q.includes('购买') || q.includes('出售')) {
        return 'jiaoyi';
      }
      // 生意合伙
      if (q.includes('合伙') || q.includes('合作') || q.includes('合伙做生意')) {
        return 'hehuo';
      }
      // 店铺开张
      if (q.includes('开店') || q.includes('开张') || q.includes('开业') || q.includes('店铺')) {
        return 'kaidian';
      }
      // 索债
      if (q.includes('索债') || q.includes('讨债') || q.includes('要债') || q.includes('欠债')) {
        return 'suozhai';
      }
      // 股票
      if (q.includes('股票') || q.includes('炒股')) {
        return 'gupiao';
      }
      // 出行吉凶
      if (q.includes('出行') && (q.includes('吉凶') || q.includes('是否') || q.includes('好不好'))) {
        return 'chuxingjixiong';
      }
      // 期货
      if (q.includes('期货')) {
        return 'qihuo';
      }
      // 寻人
      if (q.includes('寻人') || q.includes('找人') || q.includes('失踪')) {
        return 'xunren';
      }
      // 寻物
      if (q.includes('寻物') || q.includes('找东西') || q.includes('失物') || q.includes('丢东西')) {
        return 'xunwu';
      }
      // 出行择方
      if (q.includes('出行') && q.includes('方向')) {
        return 'chuxingfangxiang';
      }
      // 请客来否
      if (q.includes('请客') || q.includes('来不来') || q.includes('是否来')) {
        return 'qingke';
      }
      // 办事预测
      if (q.includes('办事') || q.includes('办事情') || q.includes('能否办成')) {
        return 'banshi';
      }
      // 占雨
      if (q.includes('下雨') || q.includes('降雨') || q.includes('天气') && q.includes('雨')) {
        return 'zanyu';
      }
      // 占晴
      if (q.includes('晴天') || q.includes('天晴') || q.includes('天气') && q.includes('晴')) {
        return 'zhanqing';
      }
      // 功名预测
      if (q.includes('功名') || q.includes('考试') || q.includes('科名') || q.includes('升学')) {
        return 'gongming';
      }
      // 交友
      if (q.includes('交友') || q.includes('交朋友') || q.includes('朋友')) {
        return 'jiaoyou';
      }
      // 词讼预测
      if (q.includes('词讼') || q.includes('官司') || q.includes('诉讼') || q.includes('打官司')) {
        return 'cisong';
      }
      // 失物预测
      if (q.includes('失物') || q.includes('丢失') || q.includes('被盗')) {
        return 'shiwu';
      }
      // 访友预测
      if (q.includes('访友') || q.includes('拜访') || q.includes('看望')) {
        return 'fangyou';
      }
      // 放债预测
      if (q.includes('放债') || q.includes('借钱给别人')) {
        return 'fangzhai';
      }
      // 利息预测
      if (q.includes('利息') || q.includes('得利') || q.includes('利润')) {
        return 'lixi';
      }
      // 疾病预测
      if (q.includes('疾病') || q.includes('生病') || q.includes('病') || q.includes('健康')) {
        return 'jibing';
      }
      // 博弈胜负
      if (q.includes('博弈') || q.includes('比赛') || q.includes('胜负')) {
        return 'boyi';
      }
      // 彩票预测
      if (q.includes('彩票') || q.includes('买彩票')) {
        return 'caipiao';
      }
      // 赌博预测
      if (q.includes('赌博') || q.includes('打牌')) {
        return 'dubo';
      }
      // 胎孕预测
      if (q.includes('胎孕') || q.includes('怀孕') || q.includes('生子')) {
        return 'taiyun';
      }
      // 寿命预测
      if (q.includes('寿命') || q.includes('寿数')) {
        return 'shouming';
      }
      // 工作相关
      if (q.includes('工作') || q.includes('事业') || q.includes('职业') || q.includes('升职')) {
        return 'work';
      }
      // 感情相关
      if (q.includes('感情') || q.includes('恋爱') || q.includes('婚姻') || q.includes('爱情')) {
        return 'love';
      }
      // 一般求财
      if (q.includes('财') || q.includes('钱') || q.includes('投资')) {
        return 'money';
      }
      return 'general';
    },
    generateSummary(grid, questionType) {
      const goodGates = grid.filter(cell => ['开', '休', '生'].includes(cell.bamenTianPan));
      const badGates = grid.filter(cell => ['死', '惊', '伤'].includes(cell.bamenTianPan));
      
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
    getWuxingRelation(wuxing1, wuxing2) {
      const wuxingCycle = {
        '木': { '生': '火', '被生': '水', '克': '土', '被克': '金' },
        '火': { '生': '土', '被生': '木', '克': '金', '被克': '水' },
        '土': { '生': '金', '被生': '火', '克': '水', '被克': '木' },
        '金': { '生': '水', '被生': '土', '克': '木', '被克': '火' },
        '水': { '生': '木', '被生': '金', '克': '火', '被克': '土' }
      };
      
      if (!wuxing1 || !wuxing2) return 0;
      if (wuxing1 === wuxing2) return 0;
      
      const cycle1 = wuxingCycle[wuxing1];
      if (!cycle1) return 0;
      
      if (cycle1['生'] === wuxing2) return 1; // 生
      if (cycle1['克'] === wuxing2) return -1; // 克
      return 0;
    },
    isGoodPattern(cell) {
      if (!cell.tianganTianPan || !cell.tianganDiPan) return false;
      const jixiongGe = this.getJixiongGe(cell.tianganTianPan, cell.tianganDiPan);
      return jixiongGe && jixiongGe.jixiong === '吉';
    },
    isSanQi(tiangan) {
      return ['乙', '丙', '丁'].includes(tiangan);
    },
    isGoodGate(gate) {
      return ['开', '休', '生'].includes(gate);
    },
    isGoodStar(star) {
      const goodStars = ['天辅', '天心', '天任', '天禽'];
      return goodStars.includes(star);
    },
    getTianganGong(tiangan, grid, isTianPan = true) {
      return grid.find(cell => {
        const tianganValue = isTianPan ? cell.tianganTianPan : cell.tianganDiPan;
        return tianganValue === tiangan;
      });
    },
    getReferenceRule(questionType) {
      const rules = {
        'qiucai': '看生门落何宫，吉格吉星求财必得。一有不吉所求减半。生门旺相求财有利，休囚不可得，生门落一宫求财不利。',
        'chuxing': '如其所往之方得三奇吉格，出行经商人的年命又生日干落宫的五行则为上吉。',
        'jiaoyi': '值符为买物之人，生门为所买的东西，生门落宫为物主。生门宫若生值符宫其物可买，预示价有利。生门宫与值符落宫相生，表示物主留恋此物，其物难买。如五行相克则表示其物己成交。如值符宫五行得旺相又生生门宫的五行，对卖者有利。如生门宫五行去生值符宫的五行，对买者有利。凡想买东西，要看卖主一方的方位，得吉格才对自己有利，反之不利。凡想卖东西，要看买主一方的方位，得吉格才对自己有利，凶格对自己不利。',
        'hehuo': '地盘生门为有资金一方，天盘生门落宫为伙计一方。如地盘五行克天盘五行，预示合伙不成。如天盘五行克地盘五行也不利，如天盘五行生地盘五行，合伙对主人有利，如地盘五行生天盘五行全美，各方面都有利。',
        'kaidian': '开门为店铺，生门为本利，日干为开设店铺之人，看开门、生门及日干上各得何格，并按五行生克综合分析论断。',
        'suozhai': '如伤门与天乙宫同生值符五行，索债可全得，如同克值符，欠债人不还，如伤门生值符克天乙宫五行，欠债可还，如生天乙宫克值符，不还，如甲子戊会开门加囚地时干，其债速还，若天乙乘庚辛来克值符，或值符克天乙乘六丁，或门加入四宫，可能有经官之事。',
        'gupiao': '以时干为股民，以日干为股息，以日干所落宫的门为跌落，以星为上升，以八神为投，以宫为收。',
        'chuxingjixiong': '值使落宫吉为顺，凶为不顺，看八神主事发及路程情况。',
        'qihuo': '以值使为货主，以星为投，以天盘天干为收。',
        'xunren': '日干为失踪人，落宫是失踪人方位，门是失踪人情况，时干为测试人（寻人的人）。',
        'xunwu': '开门与时干相比，时干为寻物人，开门为物品，开门所落宫是物品宫。',
        'chuxingfangxiang': '以日干所落的宫为出行方向，吉则从宫走，凶则顺值符走。',
        'qingke': '以值符为客人，天乙为主人，五行生克决定来否。天乙宫五行克值符宫五行来。',
        'banshi': '值使所落的宫，凶不干，吉则干。',
        'zanyu': '以天柱为雨，天英为电，天辅为风，天冲为雷，天蓬壬癸为水，开伤为雷，休为云雨，生为风，杜为电，景为露，死为水，惊为虹。以天地二盘值符值使生克推断决定。克为破，地盘不可克天盘',
        'zhanqing': '以天辅为风，天英、景门为火。天辅、天英、景门所乘之宫得旺相为晴。克日和时的天干也为晴。',
        'gongming': '日干为学士，值符为考官，天乙为分考官，如值符天乙来生日干景门五行，又得旺相者，必获得科名，再遇三奇吉门吉宿在本人年干上，大利。看本人年干上如有三奇和吉门大吉利，名易得，虽得奇门而不得吉门，名不能得，提吉门而不得三奇，终必成功。',
        'jiaoyou': '以日干落宫为己身，以时干为友人，以五行生克和所得何星何格论之。',
        'cisong': '值符为原告，天乙为被告，以开门为警官，惊门为讼师，以生克，旺相休囚决断胜负。',
        'shiwu': '看八卦之象，为失物的卦落地盘何宫，此宫上顶盘方位得玄武星座，预示为被人盗去，不见玄武，示为自己丢失，丢物之时辰如落在"空亡"的位置，不能找回，失物的时辰所落宫如在内四宫，为在宅中丢失，如在外四宫，主失落到较远的地方，再按地盘宫分别定其所属八卦的方向，地盘上的干支来看丢失或找回的日期，如是失盗，看玄武所在方位的天盘星，是阳星为男盗，是阴星为女盗，有旺相气为青年人，无旺相气则是老人，用时辰的天干所落宫来测其衣服颜色。',
        'fangyou': '凡访友寻人，以所往方地盘宫为主人，天盘星为客人，两盘同方位上的五行相生或相合，或有三奇与吉门，去必相遇，若门凶或上下二盘相克则不遇，庚的方位如出现年格、月格、日格、时格时，预示也不能遇见被访之人。',
        'fangzhai': '以值符为放债人，天乙小值符为借债人，生门为财神，以五行生克旺相论断，值符五行克天乙五行则吉，天乙五行生值符也有利，否则不吉。',
        'lixi': '凡占贸易得利多少，要凭生门所临之宫论断，旺能多得利，相则利平常，休囚利则微，休囚有凶格预示要折本，生门居旺相，再看甲子戊上乘何干以决定其数。',
        'jibing': '以天芮为病，生死二门为生、死，以本人年干落宫得生死二门及休囚废没决其生死。另一法以时干为病神，值符为病，时干加地盘星为医生，值使加三奇或六仪为病痊之期，值使落宫的五行如生时干宫的五行，病容易好，否则难好，时干宫五行克值使宫五行也容易好，否则好的慢。',
        'boyi': '值符落宫为主方，六庚落宫为客方，五行生克论胜负，博弈看值符，值符如加伤门，表示能胜。',
        'caipiao': '以当前预测位置为中心。以售彩票的地点为目的地，得一方向。购彩票的人为客。应以伤门方向去购买。并且得奇收获较大。可用本软件的排盘系统找出伤门方位。',
        'dubo': '以自己当前位置为中心，以要去的地方为目的地，得一方向。以先到人为主，其他的人为客。应以出伤门者而在赌博的地点座伤门位置者为佳。如果赌博时，伤门正好在兑七，乾六，则该方向的人大胜。可用本软件的排盘系统找出伤门方位。',
        'taiyun': '以坤为主妇，坤上得门为胎儿，八门属阴阳分男女，如所生之时的时干在天地二盘上遇吉星又有奇门吉格，又与年命五行相生者，长命吉。',
        'shouming': '人以九十为标准，每宫为十年，看天冲星落宫与死门之间相距远近定人寿数，阳遁顺数，阴遁逆数，逢五行旺相者，一生没有什么灾害，否则一生常有坎坷。'
      };
      return rules[questionType] || '';
    },
    getSpecificAnalysis(grid, questionType) {
      let result = null;
      switch (questionType) {
        case 'qiucai':
          result = this.analyzeQiucai(grid);
          break;
        case 'chuxing':
          result = this.analyzeChuxing(grid);
          break;
        case 'jiaoyi':
          result = this.analyzeJiaoyi(grid);
          break;
        case 'hehuo':
          result = this.analyzeHehuo(grid);
          break;
        case 'kaidian':
          result = this.analyzeKaidian(grid);
          break;
        case 'suozhai':
          result = this.analyzeSuozhai(grid);
          break;
        case 'gupiao':
          result = this.analyzeGupiao(grid);
          break;
        case 'chuxingjixiong':
          result = this.analyzeChuxingJixiong(grid);
          break;
        case 'qihuo':
          result = this.analyzeQihuo(grid);
          break;
        case 'xunren':
          result = this.analyzeXunren(grid);
          break;
        case 'xunwu':
          result = this.analyzeXunwu(grid);
          break;
        case 'chuxingfangxiang':
          result = this.analyzeChuxingFangxiang(grid);
          break;
        case 'qingke':
          result = this.analyzeQingke(grid);
          break;
        case 'banshi':
          result = this.analyzeBanshi(grid);
          break;
        case 'zanyu':
          result = this.analyzeZanyu(grid);
          break;
        case 'zhanqing':
          result = this.analyzeZhanqing(grid);
          break;
        case 'gongming':
          result = this.analyzeGongming(grid);
          break;
        case 'jiaoyou':
          result = this.analyzeJiaoyou(grid);
          break;
        case 'cisong':
          result = this.analyzeCisong(grid);
          break;
        case 'shiwu':
          result = this.analyzeShiwu(grid);
          break;
        case 'fangyou':
          result = this.analyzeFangyou(grid);
          break;
        case 'fangzhai':
          result = this.analyzeFangzhai(grid);
          break;
        case 'lixi':
          result = this.analyzeLixi(grid);
          break;
        case 'jibing':
          result = this.analyzeJibing(grid);
          break;
        case 'boyi':
          result = this.analyzeBoyi(grid);
          break;
        case 'caipiao':
          result = this.analyzeCaipiao(grid);
          break;
        case 'dubo':
          result = this.analyzeDubo(grid);
          break;
        case 'taiyun':
          result = this.analyzeTaiyun(grid);
          break;
        case 'shouming':
          result = this.analyzeShouming(grid);
          break;
        case 'work':
          result = this.analyzeWork(grid);
          break;
        case 'love':
          result = this.analyzeLove(grid);
          break;
        case 'money':
          result = this.analyzeMoney(grid);
          break;
        case 'health':
          result = this.analyzeHealth(grid);
          break;
        default:
          return null;
      }
      
      if (result) {
        return {
          content: result,
          reference: this.getReferenceRule(questionType)
        };
      }
      return null;
    },
    // 求财分析
    analyzeQiucai(grid) {
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      if (!shengmenCell) return '生门未出现，求财不利。';
      
      const shengmenPos = this.getPositionNameByPosition(shengmenCell.position);
      const isGoodPattern = this.isGoodPattern(shengmenCell);
      const starName = shengmenCell.jiuxingTianPan || shengmenCell.jiuxing;
      const isGoodStar = this.isGoodStar(starName);
      
      let result = `生门落在${shengmenPos}宫（${shengmenCell.position}宫）。`;
      
      if (isGoodPattern && isGoodStar) {
        result += '生门得吉格吉星，求财必得。';
      } else if (isGoodPattern || isGoodStar) {
        result += '生门得吉格或吉星，所求减半。';
      } else {
        result += '生门未得吉格吉星，求财不利。';
      }
      
      if (shengmenCell.position === 1) {
        result += '生门落坎一宫，求财不利。';
      }
      
      return result;
    },
    // 出行经商分析
    analyzeChuxing(grid) {
      const sanQiCells = grid.filter(cell => {
        if (!cell.tianganTianPan) return false;
        return this.isSanQi(cell.tianganTianPan);
      });
      
      if (sanQiCells.length === 0) {
        return '未找到三奇吉格，出行经商需谨慎。';
      }
      
      const goodSanQiCells = sanQiCells.filter(cell => this.isGoodPattern(cell));
      if (goodSanQiCells.length > 0) {
        const cell = goodSanQiCells[0];
        const pos = this.getPositionNameByPosition(cell.position);
        return `出行经商方向：${pos}宫（${cell.position}宫）得三奇吉格，出行经商有利。`;
      }
      
      return '出行经商方向需谨慎选择，建议选择三奇吉格所在方位。';
    },
    // 交易分析
    analyzeJiaoyi(grid) {
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      
      if (!zhiFuCell || !shengmenCell) {
        return '值符或生门未出现，无法进行交易分析。';
      }
      
      const zhiFuWuxing = this.getGongWuxing(zhiFuCell.position);
      const shengmenWuxing = this.getGongWuxing(shengmenCell.position);
      const relation = this.getWuxingRelation(shengmenWuxing, zhiFuWuxing);
      
      let result = `值符（买物之人）在${this.getPositionNameByPosition(zhiFuCell.position)}宫，生门（所买之物）在${this.getPositionNameByPosition(shengmenCell.position)}宫。`;
      
      if (relation === 1) {
        result += '生门宫生值符宫，其物可买，价有利。';
      } else if (relation === 0) {
        result += '生门宫与值符宫相生，表示物主留恋此物，其物难买。';
      } else if (relation === -1) {
        result += '五行相克，表示其物已成交。';
      }
      
      return result;
    },
    // 生意合伙分析
    analyzeHehuo(grid) {
      const shengmenDiPanCell = grid.find(cell => cell.bamenDiPan === '生');
      const shengmenTianPanCell = grid.find(cell => cell.bamenTianPan === '生');
      
      if (!shengmenDiPanCell || !shengmenTianPanCell) {
        return '地盘生门或天盘生门未出现，无法进行合伙分析。';
      }
      
      const diPanWuxing = this.getGongWuxing(shengmenDiPanCell.position);
      const tianPanWuxing = this.getGongWuxing(shengmenTianPanCell.position);
      const relation = this.getWuxingRelation(tianPanWuxing, diPanWuxing);
      
      let result = `地盘生门（有资金一方）在${this.getPositionNameByPosition(shengmenDiPanCell.position)}宫，天盘生门（伙计一方）在${this.getPositionNameByPosition(shengmenTianPanCell.position)}宫。`;
      
      if (relation === -1) {
        result += '地盘五行克天盘五行，预示合伙不成。';
      } else if (relation === 1) {
        result += '天盘五行克地盘五行也不利。';
      } else if (relation === 1 && this.getWuxingRelation(diPanWuxing, tianPanWuxing) === 1) {
        result += '天盘五行生地盘五行，合伙对主人有利。';
      } else if (this.getWuxingRelation(diPanWuxing, tianPanWuxing) === 1) {
        result += '地盘五行生天盘五行全美，各方面都有利。';
      }
      
      return result;
    },
    // 店铺开张分析
    analyzeKaidian(grid) {
      const kaimenCell = grid.find(cell => cell.bamenTianPan === '开');
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      const riganCell = this.getTianganGong(this.panData.dayGanZhi[0], grid, true);
      
      let result = '店铺开张分析：';
      if (kaimenCell) {
        const kaimenGe = this.getJixiongGe(kaimenCell.tianganTianPan, kaimenCell.tianganDiPan);
        result += `开门（店铺）在${this.getPositionNameByPosition(kaimenCell.position)}宫，${kaimenGe ? kaimenGe.name : '无特殊格局'}。`;
      }
      if (shengmenCell) {
        const shengmenGe = this.getJixiongGe(shengmenCell.tianganTianPan, shengmenCell.tianganDiPan);
        result += `生门（本利）在${this.getPositionNameByPosition(shengmenCell.position)}宫，${shengmenGe ? shengmenGe.name : '无特殊格局'}。`;
      }
      if (riganCell) {
        const riganGe = this.getJixiongGe(riganCell.tianganTianPan, riganCell.tianganDiPan);
        result += `日干（开设店铺之人）在${this.getPositionNameByPosition(riganCell.position)}宫，${riganGe ? riganGe.name : '无特殊格局'}。`;
      }
      
      return result;
    },
    // 索债分析
    analyzeSuozhai(grid) {
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const shangmenCell = grid.find(cell => cell.bamenTianPan === '伤');
      
      if (!zhiFuCell || !shangmenCell) {
        return '值符或伤门未出现，无法进行索债分析。';
      }
      
      const zhiFuWuxing = this.getGongWuxing(zhiFuCell.position);
      const shangmenWuxing = this.getGongWuxing(shangmenCell.position);
      
      let result = `值符在${this.getPositionNameByPosition(zhiFuCell.position)}宫，伤门在${this.getPositionNameByPosition(shangmenCell.position)}宫。`;
      
      if (this.getWuxingRelation(shangmenWuxing, zhiFuWuxing) === 1) {
        result += '伤门与值符宫同生值符五行，索债可全得。';
      } else if (this.getWuxingRelation(shangmenWuxing, zhiFuWuxing) === -1) {
        result += '伤门与值符宫同克值符，欠债人不还。';
      } else {
        result += '需根据具体情况判断。';
      }
      
      return result;
    },
    // 股票分析
    analyzeGupiao(grid) {
      const shiganCell = this.getTianganGong(this.panData.timeGanZhi[0], grid, true);
      const riganCell = this.getTianganGong(this.panData.dayGanZhi[0], grid, true);
      
      let result = '股票分析：';
      if (shiganCell) {
        result += `时干（股民）在${this.getPositionNameByPosition(shiganCell.position)}宫。`;
      }
      if (riganCell) {
        const men = riganCell.bamenTianPan || '无门';
        const xing = riganCell.jiuxingTianPan || '无星';
        result += `日干（股息）在${this.getPositionNameByPosition(riganCell.position)}宫，门（跌落）为${men}，星（上升）为${xing}。`;
      }
      
      return result;
    },
    // 出行吉凶分析
    analyzeChuxingJixiong(grid) {
      const zhiShiCell = grid.find(cell => cell.isZhiShiMen);
      
      if (!zhiShiCell) {
        return '值使未出现，无法进行出行吉凶分析。';
      }
      
      const isGood = this.isGoodPattern(zhiShiCell) && this.isGoodGate(zhiShiCell.bamenTianPan);
      const pos = this.getPositionNameByPosition(zhiShiCell.position);
      
      if (isGood) {
        return `值使落${pos}宫，得吉格吉门，出行顺利。`;
      } else {
        return `值使落${pos}宫，得凶格凶门，出行不顺，需谨慎。`;
      }
    },
    // 期货分析
    analyzeQihuo(grid) {
      const zhiShiCell = grid.find(cell => cell.isZhiShiMen);
      const tianGanCell = grid.find(cell => cell.tianganTianPan);
      
      let result = '期货分析：';
      if (zhiShiCell) {
        result += `值使（货主）在${this.getPositionNameByPosition(zhiShiCell.position)}宫。`;
      }
      if (tianGanCell) {
        const xing = tianGanCell.jiuxingTianPan || '无星';
        result += `星（投）为${xing}，天盘天干（收）为${tianGanCell.tianganTianPan}。`;
      }
      
      return result;
    },
    // 寻人分析
    analyzeXunren(grid) {
      const riganCell = this.getTianganGong(this.panData.dayGanZhi[0], grid, true);
      const shiganCell = this.getTianganGong(this.panData.timeGanZhi[0], grid, true);
      
      let result = '寻人分析：';
      if (riganCell) {
        const men = riganCell.bamenTianPan || '无门';
        result += `日干（失踪人）在${this.getPositionNameByPosition(riganCell.position)}宫，门（失踪人情况）为${men}。`;
      }
      if (shiganCell) {
        result += `时干（寻人的人）在${this.getPositionNameByPosition(shiganCell.position)}宫。`;
      }
      
      return result;
    },
    // 寻物分析
    analyzeXunwu(grid) {
      const kaimenCell = grid.find(cell => cell.bamenTianPan === '开');
      const shiganCell = this.getTianganGong(this.panData.timeGanZhi[0], grid, true);
      
      if (!kaimenCell || !shiganCell) {
        return '开门或时干未出现，无法进行寻物分析。';
      }
      
      const kaimenPos = this.getPositionNameByPosition(kaimenCell.position);
      const shiganPos = this.getPositionNameByPosition(shiganCell.position);
      
      if (kaimenCell.position === shiganCell.position) {
        return `开门与时干同宫，时干（寻物人）在${shiganPos}宫，开门（物品）在${kaimenPos}宫，物品可能在此方位。`;
      } else {
        return `时干（寻物人）在${shiganPos}宫，开门（物品）在${kaimenPos}宫，物品可能在开门所在方位。`;
      }
    },
    // 出行择方分析
    analyzeChuxingFangxiang(grid) {
      const riganCell = this.getTianganGong(this.panData.dayGanZhi[0], grid, true);
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      
      if (!riganCell) {
        return '日干未出现，无法进行出行择方分析。';
      }
      
      const riganPos = this.getPositionNameByPosition(riganCell.position);
      const isGood = this.isGoodPattern(riganCell) && this.isGoodGate(riganCell.bamenTianPan);
      
      if (isGood) {
        return `日干所落宫为${riganPos}宫，得吉格吉门，出行方向：从${riganPos}宫走。`;
      } else if (zhiFuCell) {
        const zhiFuPos = this.getPositionNameByPosition(zhiFuCell.position);
        return `日干所落宫为${riganPos}宫，得凶格凶门，出行方向：顺值符走，即${zhiFuPos}宫方向。`;
      }
      
      return `日干所落宫为${riganPos}宫，建议谨慎选择出行方向。`;
    },
    // 请客来否分析
    analyzeQingke(grid) {
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const tianYiCell = grid.find(cell => cell.bashen === '太阴'); // 天乙通常用太阴代表
      
      if (!zhiFuCell) {
        return '值符未出现，无法进行请客来否分析。';
      }
      
      const zhiFuWuxing = this.getGongWuxing(zhiFuCell.position);
      const tianYiWuxing = tianYiCell ? this.getGongWuxing(tianYiCell.position) : null;
      
      if (tianYiWuxing) {
        const relation = this.getWuxingRelation(tianYiWuxing, zhiFuWuxing);
        if (relation === -1) {
          return '天乙宫五行克值符宫五行，客人会来。';
        } else {
          return '天乙宫五行不克值符宫五行，客人可能不来。';
        }
      }
      
      return '无法确定客人是否来，需结合其他因素判断。';
    },
    // 办事预测分析
    analyzeBanshi(grid) {
      const zhiShiCell = grid.find(cell => cell.isZhiShiMen);
      
      if (!zhiShiCell) {
        return '值使未出现，无法进行办事预测分析。';
      }
      
      const isGood = this.isGoodPattern(zhiShiCell) && this.isGoodGate(zhiShiCell.bamenTianPan);
      const pos = this.getPositionNameByPosition(zhiShiCell.position);
      
      if (isGood) {
        return `值使所落宫为${pos}宫，得吉格吉门，办事可成。`;
      } else {
        return `值使所落宫为${pos}宫，得凶格凶门，办事不成。`;
      }
    },
    // 占雨分析
    analyzeZanyu(grid) {
      const tianzhuCell = grid.find(cell => cell.jiuxingTianPan === '天柱');
      const tianyingCell = grid.find(cell => cell.jiuxingTianPan === '天英');
      const tianfuCell = grid.find(cell => cell.jiuxingTianPan === '天辅');
      const tianchongCell = grid.find(cell => cell.jiuxingTianPan === '天冲');
      
      let result = '占雨分析：';
      if (tianzhuCell) result += `天柱（雨）在${this.getPositionNameByPosition(tianzhuCell.position)}宫。`;
      if (tianyingCell) result += `天英（电）在${this.getPositionNameByPosition(tianyingCell.position)}宫。`;
      if (tianfuCell) result += `天辅（风）在${this.getPositionNameByPosition(tianfuCell.position)}宫。`;
      if (tianchongCell) result += `天冲（雷）在${this.getPositionNameByPosition(tianchongCell.position)}宫。`;
      
      return result;
    },
    // 占晴分析
    analyzeZhanqing(grid) {
      const tianfuCell = grid.find(cell => cell.jiuxingTianPan === '天辅');
      const tianyingCell = grid.find(cell => cell.jiuxingTianPan === '天英');
      const jingmenCell = grid.find(cell => cell.bamenTianPan === '景');
      
      let result = '占晴分析：';
      if (tianfuCell) result += `天辅（风）在${this.getPositionNameByPosition(tianfuCell.position)}宫。`;
      if (tianyingCell) result += `天英（火）在${this.getPositionNameByPosition(tianyingCell.position)}宫。`;
      if (jingmenCell) result += `景门（火）在${this.getPositionNameByPosition(jingmenCell.position)}宫。`;
      
      return result + '天辅、天英、景门所乘之宫得旺相为晴。';
    },
    // 功名预测分析
    analyzeGongming(grid) {
      const riganCell = this.getTianganGong(this.panData.dayGanZhi[0], grid, true);
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const jingmenCell = grid.find(cell => cell.bamenTianPan === '景');
      
      let result = '功名预测：';
      if (riganCell) {
        result += `日干（学士）在${this.getPositionNameByPosition(riganCell.position)}宫。`;
      }
      if (zhiFuCell) {
        result += `值符（考官）在${this.getPositionNameByPosition(zhiFuCell.position)}宫。`;
      }
      if (jingmenCell) {
        const isGood = this.isGoodPattern(jingmenCell);
        result += `景门在${this.getPositionNameByPosition(jingmenCell.position)}宫，${isGood ? '得吉格，有利于获得科名。' : '需努力争取。'}`;
      }
      
      return result;
    },
    // 交友分析
    analyzeJiaoyou(grid) {
      const riganCell = this.getTianganGong(this.panData.dayGanZhi[0], grid, true);
      const shiganCell = this.getTianganGong(this.panData.timeGanZhi[0], grid, true);
      
      if (!riganCell || !shiganCell) {
        return '日干或时干未出现，无法进行交友分析。';
      }
      
      const riganWuxing = this.getGongWuxing(riganCell.position);
      const shiganWuxing = this.getGongWuxing(shiganCell.position);
      const relation = this.getWuxingRelation(shiganWuxing, riganWuxing);
      
      let result = `日干（己身）在${this.getPositionNameByPosition(riganCell.position)}宫，时干（友人）在${this.getPositionNameByPosition(shiganCell.position)}宫。`;
      
      if (relation === 1) {
        result += '时干生日干，交友有利。';
      } else if (relation === -1) {
        result += '时干克日干，交友需谨慎。';
      } else {
        result += '时干与日干比和，交友一般。';
      }
      
      return result;
    },
    // 词讼预测分析
    analyzeCisong(grid) {
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const tianYiCell = grid.find(cell => cell.bashen === '太阴');
      const kaimenCell = grid.find(cell => cell.bamenTianPan === '开');
      const jingmenCell = grid.find(cell => cell.bamenTianPan === '惊');
      
      let result = '词讼预测：';
      if (zhiFuCell) {
        result += `值符（原告）在${this.getPositionNameByPosition(zhiFuCell.position)}宫。`;
      }
      if (tianYiCell) {
        result += `天乙（被告）在${this.getPositionNameByPosition(tianYiCell.position)}宫。`;
      }
      if (kaimenCell) {
        result += `开门（警官）在${this.getPositionNameByPosition(kaimenCell.position)}宫。`;
      }
      if (jingmenCell) {
        result += `惊门（讼师）在${this.getPositionNameByPosition(jingmenCell.position)}宫。`;
      }
      
      return result + '需根据五行生克、旺相休囚决断胜负。';
    },
    // 失物预测分析
    analyzeShiwu(grid) {
      const xuanwuCell = grid.find(cell => cell.bashen === '腾蛇'); // 玄武通常用腾蛇代表
      
      let result = '失物预测：';
      
      // 检查是否有空亡
      const kongwangCells = grid.filter(cell => cell.hasKongWang);
      if (kongwangCells.length > 0) {
        result += '失物时辰落在空亡位置，可能不能找回。';
      }
      
      if (xuanwuCell) {
        result += `腾蛇（可能为盗）在${this.getPositionNameByPosition(xuanwuCell.position)}宫，预示为被人盗去。`;
      } else {
        result += '未见腾蛇，示为自己丢失。';
      }
      
      return result;
    },
    // 访友预测分析
    analyzeFangyou(grid) {
      const gengCells = grid.filter(cell => cell.tianganTianPan === '庚' || cell.tianganDiPan === '庚');
      
      let result = '访友预测：';
      
      if (gengCells.length > 0) {
        result += '庚的方位出现，需注意可能不能遇见被访之人。';
      } else {
        result += '未出现庚，访友可能相遇。';
      }
      
      return result;
    },
    // 放债预测分析
    analyzeFangzhai(grid) {
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const tianYiCell = grid.find(cell => cell.bashen === '太阴');
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      
      if (!zhiFuCell || !tianYiCell) {
        return '值符或天乙未出现，无法进行放债分析。';
      }
      
      const zhiFuWuxing = this.getGongWuxing(zhiFuCell.position);
      const tianYiWuxing = this.getGongWuxing(tianYiCell.position);
      const relation = this.getWuxingRelation(zhiFuWuxing, tianYiWuxing);
      
      let result = `值符（放债人）在${this.getPositionNameByPosition(zhiFuCell.position)}宫，天乙（借债人）在${this.getPositionNameByPosition(tianYiCell.position)}宫。`;
      
      if (relation === -1) {
        result += '值符五行克天乙五行，放债有利。';
      } else if (relation === 1) {
        result += '天乙五行生值符，也有利。';
      } else {
        result += '需谨慎，可能不利。';
      }
      
      return result;
    },
    // 利息预测分析
    analyzeLixi(grid) {
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      
      if (!shengmenCell) {
        return '生门未出现，无法进行利息预测分析。';
      }
      
      const pos = this.getPositionNameByPosition(shengmenCell.position);
      const isGood = this.isGoodPattern(shengmenCell);
      
      let result = `生门所临之宫为${pos}宫。`;
      
      if (isGood) {
        result += '生门居旺相，能多得利。';
      } else {
        result += '生门休囚，利则微，需注意可能折本。';
      }
      
      return result;
    },
    // 疾病预测分析
    analyzeJibing(grid) {
      const tianruiCell = grid.find(cell => cell.jiuxingTianPan === '天芮' || cell.jiuxingDiPan === '天芮');
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      const simenCell = grid.find(cell => cell.bamenTianPan === '死');
      
      let result = '疾病预测：';
      
      if (tianruiCell) {
        result += `天芮（病）在${this.getPositionNameByPosition(tianruiCell.position)}宫。`;
      }
      if (shengmenCell) {
        result += `生门（生）在${this.getPositionNameByPosition(shengmenCell.position)}宫。`;
      }
      if (simenCell) {
        result += `死门（死）在${this.getPositionNameByPosition(simenCell.position)}宫。`;
      }
      
      return result + '需根据生死二门及休囚废没决其生死。';
    },
    // 博弈胜负分析
    analyzeBoyi(grid) {
      const zhiFuCell = grid.find(cell => cell.bashen === '值符');
      const liugengCell = grid.find(cell => cell.tianganTianPan === '庚' || cell.tianganDiPan === '庚');
      
      if (!zhiFuCell) {
        return '值符未出现，无法进行博弈胜负分析。';
      }
      
      const zhiFuWuxing = this.getGongWuxing(zhiFuCell.position);
      const liugengWuxing = liugengCell ? this.getGongWuxing(liugengCell.position) : null;
      
      let result = `值符（主方）在${this.getPositionNameByPosition(zhiFuCell.position)}宫。`;
      
      if (liugengWuxing) {
        const relation = this.getWuxingRelation(zhiFuWuxing, liugengWuxing);
        if (relation === -1) {
          result += '值符五行克六庚五行，主方胜。';
        } else if (relation === 1) {
          result += '六庚五行生值符五行，主方胜。';
        } else {
          result += '需根据具体情况判断胜负。';
        }
      }
      
      return result;
    },
    // 彩票预测分析
    analyzeCaipiao(grid) {
      const shangmenCell = grid.find(cell => cell.bamenTianPan === '伤');
      
      if (!shangmenCell) {
        return '伤门未出现，无法进行彩票预测分析。';
      }
      
      const pos = this.getPositionNameByPosition(shangmenCell.position);
      const hasSanQi = this.isSanQi(shangmenCell.tianganTianPan);
      
      let result = `购彩票的人为客，应以伤门方向去购买。伤门在${pos}宫（${shangmenCell.position}宫）。`;
      
      if (hasSanQi) {
        result += '并且得三奇，收获较大。';
      } else {
        result += '建议选择伤门所在方位购买。';
      }
      
      return result;
    },
    // 赌博预测分析
    analyzeDubo(grid) {
      const shangmenCell = grid.find(cell => cell.bamenTianPan === '伤');
      
      if (!shangmenCell) {
        return '伤门未出现，无法进行赌博预测分析。';
      }
      
      const pos = this.getPositionNameByPosition(shangmenCell.position);
      
      if (shangmenCell.position === 7 || shangmenCell.position === 6) {
        return `伤门在${pos}宫（${shangmenCell.position}宫），该方向的人大胜。`;
      } else {
        return `伤门在${pos}宫（${shangmenCell.position}宫），建议在赌博地点座伤门位置。`;
      }
    },
    // 胎孕预测分析
    analyzeTaiyun(grid) {
      const kunCell = grid.find(cell => cell.position === 2); // 坤2宫
      
      if (!kunCell) {
        return '坤宫未找到，无法进行胎孕预测分析。';
      }
      
      const men = kunCell.bamenTianPan || '无门';
      const isGood = this.isGoodPattern(kunCell);
      
      let result = `坤（主妇）在坤2宫，门（胎儿）为${men}。`;
      
      if (isGood) {
        result += '得吉格，胎儿健康。';
      } else {
        result += '需注意胎儿健康。';
      }
      
      return result;
    },
    // 寿命预测分析
    analyzeShouming(grid) {
      const tianchongCell = grid.find(cell => cell.jiuxingTianPan === '天冲');
      const simenCell = grid.find(cell => cell.bamenTianPan === '死');
      
      if (!tianchongCell || !simenCell) {
        return '天冲星或死门未出现，无法进行寿命预测分析。';
      }
      
      const tianchongPos = tianchongCell.position;
      const simenPos = simenCell.position;
      const distance = Math.abs(tianchongPos - simenPos);
      
      let result = `天冲星在${this.getPositionNameByPosition(tianchongPos)}宫，死门在${this.getPositionNameByPosition(simenPos)}宫，相距${distance}宫。`;
      result += `人以九十为标准，每宫为十年，寿数约为${90 - distance * 10}岁左右。`;
      
      return result;
    },
    // 工作分析
    analyzeWork(grid) {
      const kaimenCell = grid.find(cell => cell.bamenTianPan === '开');
      if (kaimenCell) {
        const pos = this.getPositionNameByPosition(kaimenCell.position);
        return `工作方面，建议关注${pos}宫，开门主开放、通达，有利于事业发展。`;
      }
      return '工作方面，建议关注开门所在方位。';
    },
    // 感情分析
    analyzeLove(grid) {
      const xiumenCell = grid.find(cell => cell.bamenTianPan === '休');
      if (xiumenCell) {
        const pos = this.getPositionNameByPosition(xiumenCell.position);
        return `感情方面，${pos}宫休门主休息、休养，感情运势较好。`;
      }
      return '感情方面，建议关注休门所在方位。';
    },
    // 一般求财分析
    analyzeMoney(grid) {
      const shengmenCell = grid.find(cell => cell.bamenTianPan === '生');
      if (shengmenCell) {
        const pos = this.getPositionNameByPosition(shengmenCell.position);
        return `财运方面，${pos}宫生门主生长、生机，财运较旺。`;
      }
      return '财运方面，建议关注生门所在方位。';
    },
    // 健康分析
    analyzeHealth(grid) {
      const tianruiCell = grid.find(cell => {
        const starName = cell.jiuxingTianPan || cell.jiuxing;
        return starName === '天芮' || starName === '天心';
      });
      if (tianruiCell) {
        const starName = tianruiCell.jiuxingTianPan || tianruiCell.jiuxing;
        const pos = this.getPositionNameByPosition(tianruiCell.position);
        return `健康方面，${pos}宫${starName}星主${this.getStarMeaning(starName)}，需注意身体健康。`;
      }
      return '健康方面，建议关注天芮星和天心星所在方位。';
    }
  }
};
</script>

<style scoped>
.analysis-section {
  margin-top: 30px;
}

.question-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.question-group label {
  font-weight: bold;
  color: #555;
}

.question-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  background-color: #fff;
  cursor: pointer;
}

.question-select:focus {
  outline: none;
  border-color: #409eff;
}

.question-select option {
  padding: 8px;
}

.question-select optgroup {
  font-weight: bold;
  color: #333;
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

.result-reference {
  margin-top: 12px;
  padding: 10px;
  background-color: #f5f7fa;
  border-left: 3px solid #909399;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
}

.result-reference strong {
  color: #606266;
  display: block;
  margin-bottom: 5px;
}

.result-reference span {
  color: #606266;
  display: block;
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
</style>

