<template>
  <div class="writing-page">
    <h1 class="page-title">名著知乎文</h1>
    <p class="subtitle">选名著、填观点，一键生成适合发到知乎的评价长文</p>

    <section class="section">
      <h2 class="section-title">1. 选择名著</h2>
      <label class="field-label tight">分类</label>
      <div class="genre-row">
        <button
          v-for="c in categories"
          :key="c.id"
          :class="['chip', { active: categoryId === c.id }]"
          @click="selectCategory(c.id)"
        >{{ c.name }}</button>
      </div>
      <p class="hint">{{ currentCategory.desc }}</p>

      <label class="field-label">书目</label>
      <div class="genre-row">
        <button
          v-for="b in filteredBooks"
          :key="b.id"
          :class="['chip', { active: bookId === b.id }]"
          @click="selectBook(b.id)"
        >{{ b.title }}</button>
        <button
          :class="['chip', { active: bookId === 'custom' }]"
          @click="selectBook('custom')"
        >自定义</button>
      </div>
      <div v-if="bookId === 'custom'" class="custom-book">
        <input v-model="customTitle" class="text-input" placeholder="书名，如：围城" />
        <input v-model="customAuthor" class="text-input" placeholder="作者，如：钱钟书" />
        <input v-model="customYear" class="text-input" placeholder="年代（可选），如：1947" />
      </div>
      <p v-else class="hint">{{ currentBook.blurb }}</p>
    </section>

    <section class="section">
      <h2 class="section-title">2. 评价角度</h2>
      <div class="genre-row">
        <button
          v-for="a in angles"
          :key="a.id"
          :class="['chip', { active: angleId === a.id }]"
          @click="angleId = a.id"
        >{{ a.name }}</button>
      </div>
      <p class="hint">{{ currentAngle.desc }}</p>
    </section>

    <section class="section">
      <h2 class="section-title">3. 你的观点（决定文章调性）</h2>
      <label class="field-label">综合评分（1–10）</label>
      <div class="score-row">
        <input v-model.number="score" type="range" min="1" max="10" step="0.5" class="score-range" />
        <span class="score-num">{{ score }}</span>
      </div>

      <label class="field-label">一句话评价（可用作标题钩子）</label>
      <input
        v-model="oneLiner"
        class="text-input"
        :placeholder="currentBook.oneLinerHint || '例如：读完才懂，所谓清醒有多残酷'"
      />

      <label class="field-label">阅读情境</label>
      <input
        v-model="context"
        class="text-input"
        placeholder="例如：高三暑假硬着头皮读的；离职那天重读；失恋后第一次读懂"
      />

      <label class="field-label">最打动你的点</label>
      <textarea
        v-model="highlight"
        class="outline-input"
        rows="2"
        :placeholder="currentBook.highlightHint || '某个情节、人物、句子，或你读完后的真实感受'"
      ></textarea>

      <label class="field-label">核心人物</label>
      <input
        v-model="character"
        class="text-input"
        placeholder="例如：最难忘林黛玉；最恨宋江；方鸿渐让我又气又懂"
      />

      <label class="field-label">最大槽点 / 争议</label>
      <textarea
        v-model="flaw"
        class="outline-input"
        rows="2"
        placeholder="节奏拖沓、人物扁平、译本问题、被过度神话……没有可留空"
      ></textarea>

      <label class="field-label">常见误读（你想纠正的）</label>
      <textarea
        v-model="misread"
        class="outline-input"
        rows="2"
        placeholder="例如：很多人只当爱情悲剧；其实更狠的是家族与秩序；别只记住那句名言"
      ></textarea>

      <label class="field-label">读完带走什么</label>
      <input
        v-model="takeaway"
        class="text-input"
        placeholder="例如：少用道德审判别人；遇事先分清规则和人情；允许自己普通地活着"
      />

      <label class="field-label">适合谁读</label>
      <input
        v-model="audience"
        class="text-input"
        placeholder="例如：刚经历职场内耗的人；高中生；想补经典却怕枯燥的读者"
      />

      <label class="field-label">补充金句或细节（可选，每行一条）</label>
      <textarea
        v-model="quotes"
        class="outline-input"
        rows="3"
        placeholder="可粘贴书中句子，或写下你想展开的细节"
      ></textarea>
    </section>

    <section class="section">
      <div class="draft-actions">
        <button class="btn" @click="generate">生成知乎文章</button>
        <button class="btn ghost" @click="regenerateTitle" :disabled="!article">换个标题</button>
        <button class="btn ghost" @click="resetForm">重置</button>
      </div>
    </section>

    <section v-if="article" class="section output">
      <h2 class="section-title">4. 输出（可直接粘贴知乎）</h2>

      <div class="title-block">
        <span class="field-label">推荐标题</span>
        <p class="article-title">{{ article.title }}</p>
      </div>

      <div class="tag-row">
        <span class="field-label">建议话题</span>
        <span v-for="t in article.topics" :key="t" class="tag">{{ t }}</span>
      </div>

      <label class="field-label">正文预览</label>
      <pre class="article-body">{{ article.body }}</pre>

      <div class="draft-actions">
        <button class="btn" @click="copyAll">复制标题+正文</button>
        <button class="btn ghost" @click="copyBody">只复制正文</button>
        <button class="btn ghost" @click="copyTitle">只复制标题</button>
      </div>
      <p class="hint">知乎发文建议：标题单独填，正文粘贴后可再加分割线/图片；文末已留互动提问方便涨赞藏。</p>
    </section>
  </div>
</template>

<script>
const CATEGORIES = [
  {
    id: 'four',
    name: '四大名著',
    desc: '红楼、三国、西游、水浒——汉语小说的底盘与公共记忆。'
  },
  {
    id: 'modern-cn',
    name: '中国现当代',
    desc: '现代汉语写作里常被拿来写书评、做对照的几部。'
  },
  {
    id: 'world',
    name: '外国文学',
    desc: '译介经典，知乎上讨论密度高、容易引发对照现实的话题。'
  }
];

const BOOKS = [
  {
    id: 'honglou',
    category: 'four',
    title: '红楼梦',
    author: '曹雪芹',
    year: '清代',
    blurb: '家族兴衰与少女命运交织，是中国古典小说高峰，也是读法最多的一部书。',
    oneLinerHint: '例如：原来悲剧不是死，而是眼睁睁看着美一点点碎掉',
    highlightHint: '例如：刘姥姥进大观园、黛玉葬花、抄家前后的气氛变化……',
    topics: ['红楼梦', '经典名著', '读书', '中国文学', '小说']
  },
  {
    id: 'sanguo',
    category: 'four',
    title: '三国演义',
    author: '罗贯中',
    year: '元末明初',
    blurb: '乱世英雄、权谋忠义，后世「三国」想象多半从这里长出来。',
    oneLinerHint: '例如：最迷人的不是战争，是每个人怎么给自己的选择找理由',
    highlightHint: '例如：三顾茅庐、赤壁、失街亭、或某个你最恨/最敬的人物',
    topics: ['三国演义', '经典名著', '历史小说', '读书', '人物评价']
  },
  {
    id: 'xiyou',
    category: 'four',
    title: '西游记',
    author: '吴承恩',
    year: '明代',
    blurb: '取经是表层，紧箍、师徒、神佛体系才是常读常新的部分。',
    oneLinerHint: '例如：西游记讲的不是成佛，是怎么在规则里活成自己',
    highlightHint: '例如：三打白骨精、真假美猴王、或某段你觉得被低估的情节',
    topics: ['西游记', '经典名著', '神话', '读书', '文学解读']
  },
  {
    id: 'shuihu',
    category: 'four',
    title: '水浒传',
    author: '施耐庵',
    year: '元末明初',
    blurb: '逼上梁山的群像史诗，读到后面往往比开头更让人沉默。',
    oneLinerHint: '例如：所谓替天行道，读完只剩一股寒意',
    highlightHint: '例如：武松、林冲、宋江招安，或某次你读不下去又拾起来的理由',
    topics: ['水浒传', '经典名著', '读书', '中国文学', '社会']
  },
  {
    id: 'weicheng',
    category: 'modern-cn',
    title: '围城',
    author: '钱钟书',
    year: '1947',
    blurb: '婚姻是围城，留学、学术、知识分子的体面与窘迫同样是围城。',
    oneLinerHint: '例如：讽刺写到骨子里，笑完比哭还难受',
    highlightHint: '例如：方鸿渐、苏文纨、三闾大学，或某句让你背下来的比喻',
    topics: ['围城', '钱钟书', '经典名著', '读书', '知识分子']
  },
  {
    id: 'huozhe',
    category: 'modern-cn',
    title: '活着',
    author: '余华',
    year: '1993',
    blurb: '用极克制的叙述写尽苦难，却让「活着」本身成为答案。',
    oneLinerHint: '例如：越平静的句子，越像一记闷拳',
    highlightHint: '例如：福贵与家珍、与牛相对的结局、某次你合上书说不出话',
    topics: ['活着', '余华', '经典名著', '读书', '人生']
  },
  {
    id: '1984',
    category: 'world',
    title: '1984',
    author: '乔治·奥威尔',
    year: '1949',
    blurb: '监视、语言与真理被改写——警世寓言，也是理解当代话语的钥匙。',
    oneLinerHint: '例如：可怕的不是暴力，是你开始相信虚假本身',
    highlightHint: '例如：双重思想、新话、二分钟仇恨，或某段让你后背发凉的描写',
    topics: ['1984', '奥威尔', '反乌托邦', '经典名著', '读书']
  },
  {
    id: 'baiye',
    category: 'world',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    year: '1967',
    blurb: '马孔多的兴衰循环，魔幻外壳下是家族记忆与拉丁美洲的孤独。',
    oneLinerHint: '例如：人名记不住没关系，孤独的感觉会记住你',
    highlightHint: '例如：冰块、失眠症、雨、或某个你最喜欢的布恩迪亚',
    topics: ['百年孤独', '马尔克斯', '魔幻现实主义', '经典名著', '读书']
  }
];

const ANGLES = [
  {
    id: 'reread',
    name: '重读感悟',
    desc: '适合「读了两遍才懂」：对比前后感受，强调个人成长视角。'
  },
  {
    id: 'character',
    name: '人物深挖',
    desc: '抓住一两个角色拆开讲，知乎上人物向最容易引发讨论。'
  },
  {
    id: 'myth',
    name: '祛魅吐槽',
    desc: '承认优点，也直言被神化之处；语气坦诚，避免纯黑。'
  },
  {
    id: 'beginner',
    name: '入门导读',
    desc: '面向没读过的人：为什么读、怎么读、读完能带走什么。'
  },
  {
    id: 'compare',
    name: '对照当下',
    desc: '把名著情节映射到职场、关系、舆论等现实议题，增强共鸣。'
  }
];

const TITLE_TEMPLATES = {
  reread: [
    (b, line) => line || `重读《${b.title}》：原来当年没看懂的，是自己`,
    (b) => `隔了几年再看《${b.title}》，我才承认它配得上「名著」`,
    (b) => `《${b.title}》不适合第一次读懂，只适合被生活打醒后再读`
  ],
  character: [
    (b, line) => line || `读《${b.title}》，我总忘不掉那个人`,
    (b) => `《${b.title}》里最锋利的不是情节，是人物选择`,
    (b) => `别急着聊主题——《${b.title}》先把人写穿了`
  ],
  myth: [
    (b, line) => line || `《${b.title}》被夸过头了吗？我的真实评分`,
    (b) => `诚实讲讲《${b.title}》：神作光环之下，我也卡过壳`,
    (b) => `如果只能给《${b.title}》留一句：别神话，也别低估`
  ],
  beginner: [
    (b, line) => line || `没读过《${b.title}》？这篇当地图就够了`,
    (b) => `为什么现在还要读《${b.title}》？给犹豫党一份说明书`,
    (b) => `《${b.title}》入门：先抓住这三条线索`
  ],
  compare: [
    (b, line) => line || `《${b.title}》里的困境，今天一点没过时`,
    (b) => `把《${b.title}》放进当下看，才发现它有多锋利`,
    (b) => `职场/关系/舆论——《${b.title}》早就写过了`
  ]
};

function scoreLabel(score) {
  if (score >= 9) return '强烈推荐，值得反复读';
  if (score >= 7.5) return '值得一读，瑕不掩瑜';
  if (score >= 6) return '可读，但要带着判断力';
  if (score >= 4) return '有启发，但体验割裂';
  return '个人向不太契合，仅供参考';
}

function parseLines(text) {
  return (text || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);
}

function pickTitle(angleId, book, oneLiner, titleIndex) {
  const list = TITLE_TEMPLATES[angleId] || TITLE_TEMPLATES.reread;
  const fn = list[titleIndex % list.length];
  const raw = (oneLiner || '').trim();
  // 用户一句话足够像标题时优先用；否则用模板，首条模板可吸收 oneLiner
  if (raw && raw.length >= 8 && titleIndex === 0) return raw;
  return fn(book, raw);
}

function buildBody({
  book,
  angle,
  score,
  oneLiner,
  context,
  highlight,
  character,
  flaw,
  misread,
  takeaway,
  audience,
  quoteLines
}) {
  const authorLine = book.year
    ? `${book.author} · ${book.year}`
    : book.author;
  const who = (audience || '').trim() || '对经典感兴趣、又不想被「必读」绑架的读者';
  const hook = (oneLiner || '').trim()
    || `合上《${book.title}》之后，我脑子里只剩一句话：名著不是用来膜拜的，是用来对质生活的。`;
  const ctx = (context || '').trim();
  const hi = (highlight || '').trim() || '那些被反复引用的桥段背后，真正厉害的是作者对人性分寸的拿捏。';
  const char = (character || '').trim();
  const fl = (flaw || '').trim();
  const mis = (misread || '').trim();
  const take = (takeaway || '').trim();

  const parts = [];

  parts.push(hook);
  parts.push('');
  parts.push(`今天聊的是${authorLine}的《${book.title}》。`);
  parts.push(`先给结论：**我的评分 ${score}/10——${scoreLabel(score)}。**`);
  parts.push('');

  parts.push('## 我是在什么情况下读的');
  if (ctx) {
    parts.push(ctx);
    parts.push('情境一换，同一本书给出的答案也会变——这大概就是名著耐读的原因。');
  } else if (angle.id === 'reread') {
    parts.push(`第一次读《${book.title}》，我多半在追情节；再读时，才发觉自己被哪些细节刺到。`);
    parts.push('某种程度上，名著的「难」不是文字，是它逼你承认：你变了，或你还没变。');
  } else {
    parts.push(`说不清确切页码，但记得开读《${book.title}》时，自己正需要一个「被说中」的瞬间。`);
  }
  parts.push('');

  if (angle.id === 'beginner') {
    parts.push('## 为什么现在还要读');
    parts.push(`如果你属于「听说很经典，但怕读不下去」的那一类，可以把《${book.title}》先当成一面镜子，而不是一项任务。`);
    parts.push(`它更适合：${who}。`);
    parts.push('');
  } else if (angle.id === 'character') {
    parts.push('## 人物比主题更先抓住人');
    parts.push(char
      ? `与其空谈「深刻」，我更想先聊这个人：${char}。`
      : `与其空谈《${book.title}》的「深刻」，不如先看人怎么做选择——选择一出来，主题自己会站到台前。`);
    parts.push('');
  } else if (angle.id === 'myth') {
    parts.push('## 先把神坛拆一点');
    parts.push(`《${book.title}》当然有被夸大的时刻：社交货币、考试篇目、名人安利，都会让预期虚高。`);
    parts.push('但祛魅不等于否定。把滤镜摘掉，优点和刺反而都更清楚。');
    parts.push('');
  } else if (angle.id === 'compare') {
    parts.push('## 名著不在书里，在你此刻的处境里');
    parts.push(`把《${book.title}》从书架挪到当下：职场规则、亲密关系、舆论场——很多桥段并不过时，只是换了皮肤。`);
    parts.push('');
  } else if (angle.id === 'reread' && ctx) {
    parts.push('## 重读之后多出来的东西');
    parts.push('同一本书，第二次读往往不是「更懂情节」，而是更懂自己当年为什么没看懂。');
    parts.push('');
  }

  parts.push('## 最打动我的地方');
  parts.push(hi);
  parts.push('');

  if (char) {
    if (angle.id === 'character') {
      parts.push('TA 的选择、软肋和体面，比任何总结句都更接近这本书的核。');
    } else {
      parts.push('## 绕不开的那个人');
      parts.push(char);
      parts.push('人物立住了，主题才不用喊口号。');
    }
    parts.push('');
  }

  if (quoteLines.length) {
    parts.push('## 我想留下的句子 / 细节');
    quoteLines.forEach((q, i) => {
      parts.push(`${i + 1}. ${q}`);
    });
    parts.push('');
  }

  parts.push('## 我也必须说的「不舒服」');
  if (fl) {
    parts.push(fl);
  } else {
    parts.push(`如果硬要挑刺：阅读门槛、节奏、译本或叙事习惯，都可能让部分读者中途劝退。这不妨碍《${book.title}》成为经典，只说明经典也需要「合适的打开方式」。`);
  }
  parts.push('');

  parts.push('## 想纠正一个常见误读');
  if (mis) {
    parts.push(mis);
  } else {
    parts.push(`别急着把《${book.title}》收成一句金句或一个标签。标签好传播，却常常把复杂裁成顺口溜。`);
  }
  parts.push('');

  parts.push('## 读完我带走的一句');
  if (take) {
    parts.push(take);
  } else {
    parts.push('少一点膜拜，多一点对照——名著有用的时候，往往是它戳中你正在过的日子。');
  }
  parts.push('');

  parts.push('## 写给准备开读 / 准备安利的人');
  parts.push(`- **适合**：${who}`);
  parts.push('- **心态**：别抱着「读完就要变深刻」；带着问题读，比带着任务读更轻松');
  parts.push('- **方法**：可先抓住一条主线（人物 / 冲突 / 时代），读完再回头看结构');
  parts.push('');

  parts.push('## 收束一句');
  if (take) {
    parts.push(`若只能留一句给后来者：${take}`);
  } else if (angle.id === 'myth') {
    parts.push(`《${book.title}》不必被供着，也犯不着被踩。我的 ${score} 分，只是一次诚实的私人记账。`);
  } else if (angle.id === 'compare') {
    parts.push('当现实开始重复书里的戏码，你会突然原谅那些「老掉牙」的情节——因为它们根本没老。');
  } else {
    parts.push('名著的价值，往往不在于你读懂了多少注释，而在于某一天，生活突然把书里的某一页翻到了你面前。');
  }
  parts.push('');
  parts.push('---');
  parts.push('');
  const askChar = char ? '你站我这边，还是完全相反？' : '或被哪个人物说服/激怒？';
  parts.push(`**互动**：你读《${book.title}》时，卡在哪一页，${askChar}欢迎评论区聊聊，也想听听和我评分差很多的理由。`);
  parts.push('');
  parts.push('（若觉得有用，欢迎点赞收藏，方便下次重读前翻出来对照。）');

  return parts.join('\n');
}

export default {
  name: 'Writing',
  data() {
    return {
      books: BOOKS,
      categories: CATEGORIES,
      angles: ANGLES,
      categoryId: CATEGORIES[0].id,
      bookId: BOOKS[0].id,
      angleId: ANGLES[0].id,
      customTitle: '',
      customAuthor: '',
      customYear: '',
      score: 8,
      oneLiner: '',
      context: '',
      highlight: '',
      character: '',
      flaw: '',
      misread: '',
      takeaway: '',
      audience: '',
      quotes: '',
      article: null,
      titleIndex: 0
    };
  },
  computed: {
    currentCategory() {
      return this.categories.find(c => c.id === this.categoryId) || this.categories[0];
    },
    filteredBooks() {
      return this.books.filter(b => b.category === this.categoryId);
    },
    currentBook() {
      if (this.bookId === 'custom') {
        return {
          id: 'custom',
          title: (this.customTitle || '').trim() || '未命名名著',
          author: (this.customAuthor || '').trim() || '佚名',
          year: (this.customYear || '').trim(),
          blurb: '',
          topics: ['经典名著', '读书', '书评', '文学', (this.customTitle || '').trim()].filter(Boolean)
        };
      }
      return this.books.find(b => b.id === this.bookId) || this.filteredBooks[0] || this.books[0];
    },
    currentAngle() {
      return this.angles.find(a => a.id === this.angleId) || this.angles[0];
    }
  },
  methods: {
    selectCategory(id) {
      if (id === this.categoryId) return;
      this.categoryId = id;
      const first = this.books.find(b => b.category === id);
      this.bookId = first ? first.id : 'custom';
    },
    selectBook(id) {
      this.bookId = id;
    },
    buildArticle() {
      if (this.bookId === 'custom' && !(this.customTitle || '').trim()) {
        alert('请填写自定义书名');
        return null;
      }
      const book = this.currentBook;
      const angle = this.currentAngle;
      const quoteLines = parseLines(this.quotes);
      const title = pickTitle(this.angleId, book, this.oneLiner, this.titleIndex);
      const body = buildBody({
        book,
        angle,
        score: this.score,
        oneLiner: this.oneLiner,
        context: this.context,
        highlight: this.highlight,
        character: this.character,
        flaw: this.flaw,
        misread: this.misread,
        takeaway: this.takeaway,
        audience: this.audience,
        quoteLines
      });
      const topics = [...(book.topics || [])];
      if (!topics.includes('书评')) topics.push('书评');
      return { title, body, topics: topics.slice(0, 5) };
    },
    generate() {
      this.titleIndex = 0;
      this.article = this.buildArticle();
    },
    regenerateTitle() {
      if (!this.article) return;
      this.titleIndex += 1;
      const next = this.buildArticle();
      if (next) this.article = next;
    },
    resetForm() {
      this.score = 8;
      this.oneLiner = '';
      this.context = '';
      this.highlight = '';
      this.character = '';
      this.flaw = '';
      this.misread = '';
      this.takeaway = '';
      this.audience = '';
      this.quotes = '';
      this.article = null;
      this.titleIndex = 0;
      this.customTitle = '';
      this.customAuthor = '';
      this.customYear = '';
    },
    async copyText(text, okMsg) {
      try {
        await navigator.clipboard.writeText(text);
        alert(okMsg);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(okMsg);
      }
    },
    copyAll() {
      if (!this.article) return;
      const text = `【标题】\n${this.article.title}\n\n【话题】\n${this.article.topics.join(' · ')}\n\n【正文】\n${this.article.body}`;
      this.copyText(text, '标题与正文已复制');
    },
    copyBody() {
      if (!this.article) return;
      this.copyText(this.article.body, '正文已复制');
    },
    copyTitle() {
      if (!this.article) return;
      this.copyText(this.article.title, '标题已复制');
    }
  }
};
</script>

<style scoped>
.writing-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
  color: #222;
}

.page-title {
  margin: 0 0 6px;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0 0 24px;
  color: #666;
  font-size: 0.95rem;
}

.section {
  margin-bottom: 28px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 1.1rem;
  font-weight: 600;
}

.hint {
  margin: 8px 0 0;
  color: #777;
  font-size: 0.9rem;
  line-height: 1.5;
}

.genre-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 7px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 0.9rem;
}

.chip:hover {
  background: #e8e8e8;
}

.chip.active {
  background: #0066ff;
  color: #fff;
  border-color: #0066ff;
}

.custom-book {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.field-label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.field-label.tight {
  margin-top: 0;
}

.text-input,
.outline-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
}

.outline-input {
  resize: vertical;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-range {
  flex: 1;
  max-width: 320px;
}

.score-num {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0066ff;
  min-width: 2.5em;
}

.draft-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #0066ff;
  border-radius: 6px;
  background: #0066ff;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn.ghost {
  background: #fff;
  color: #0066ff;
}

.output {
  padding-top: 8px;
  border-top: 1px solid #e8e8e8;
}

.title-block .article-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.5;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.tag-row .field-label {
  margin: 0;
}

.tag {
  font-size: 0.85rem;
  color: #0066ff;
  border-bottom: 1px solid #99c2ff;
}

.article-body {
  margin: 0 0 14px;
  padding: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.75;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  max-height: 480px;
  overflow: auto;
}
</style>
