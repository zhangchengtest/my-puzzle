<template>
  <div class="writing-page">
    <h1 class="page-title">名著知乎文</h1>
    <p class="subtitle">先定调性与观点，最后才落书名——点选即可生成知乎长文</p>

    <section class="section">
      <h2 class="section-title">1. 分类</h2>
      <div class="genre-row">
        <button
          v-for="c in categories"
          :key="c.id"
          :class="['chip', { active: categoryId === c.id }]"
          @click="selectCategory(c.id)"
        >{{ c.name }}</button>
      </div>
      <p class="hint">{{ currentCategory.desc }}</p>
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
      <h2 class="section-title">3. 观点与调性（全选）</h2>

      <label class="field-label tight">综合评分</label>
      <div class="genre-row">
        <button
          v-for="s in scoreOptions"
          :key="s"
          :class="['chip', { active: score === s }]"
          @click="score = s"
        >{{ s }}</button>
      </div>

      <label class="field-label">一句话评价（标题钩子）</label>
      <div class="genre-row">
        <button
          v-for="o in oneLinerOptions"
          :key="o.id"
          :class="['chip', { active: oneLinerId === o.id }]"
          @click="oneLinerId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">阅读情境</label>
      <div class="genre-row">
        <button
          v-for="o in contextOptions"
          :key="o.id"
          :class="['chip', { active: contextId === o.id }]"
          @click="contextId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">最打动你的点</label>
      <div class="genre-row">
        <button
          v-for="o in highlightOptions"
          :key="o.id"
          :class="['chip', { active: highlightId === o.id }]"
          @click="highlightId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">核心人物</label>
      <div class="genre-row">
        <button
          v-for="o in characterOptions"
          :key="o.id"
          :class="['chip', { active: characterId === o.id }]"
          @click="characterId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">最大槽点 / 争议</label>
      <div class="genre-row">
        <button
          v-for="o in flawOptions"
          :key="o.id"
          :class="['chip', { active: flawId === o.id }]"
          @click="flawId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">常见误读（你想纠正的）</label>
      <div class="genre-row">
        <button
          v-for="o in misreadOptions"
          :key="o.id"
          :class="['chip', { active: misreadId === o.id }]"
          @click="misreadId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">读完带走什么</label>
      <div class="genre-row">
        <button
          v-for="o in takeawayOptions"
          :key="o.id"
          :class="['chip', { active: takeawayId === o.id }]"
          @click="takeawayId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">适合谁读</label>
      <div class="genre-row">
        <button
          v-for="o in audienceOptions"
          :key="o.id"
          :class="['chip', { active: audienceId === o.id }]"
          @click="audienceId = o.id"
        >{{ o.label }}</button>
      </div>

      <label class="field-label">展开细节（可多选）</label>
      <div class="genre-row">
        <button
          v-for="o in detailOptions"
          :key="o.id"
          :class="['chip', { active: detailIds.includes(o.id) }]"
          @click="toggleDetail(o.id)"
        >{{ o.label }}</button>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">4. 最后：落哪本书</h2>
      <p class="hint">调性定好了，再选具体书名；也可写任意一本。</p>
      <input
        v-model="bookSearch"
        class="text-input"
        placeholder="搜书名、作者"
      />
      <div class="genre-row book-row">
        <button
          v-for="b in filteredBooks"
          :key="b.id"
          :class="['chip', 'book-chip', { active: bookId === b.id, custom: b.custom }]"
          @click="selectBook(b.id)"
        >
          {{ b.title }}
          <span
            v-if="b.custom"
            class="chip-del"
            title="从书目移除"
            @click.stop="removeCustomBook(b.id)"
          >×</span>
        </button>
        <button
          :class="['chip', { active: bookId === 'custom' }]"
          @click="selectBook('custom')"
        >写任意一本</button>
      </div>
      <p v-if="!filteredBooks.length && bookId !== 'custom'" class="hint">
        当前分类没有匹配书目——点「写任意一本」即可。
      </p>
      <div v-if="bookId === 'custom'" class="custom-book">
        <input v-model="customTitle" class="text-input" placeholder="书名 *" />
        <input v-model="customAuthor" class="text-input" placeholder="作者" />
        <input v-model="customYear" class="text-input" placeholder="年代（可选）" />
        <div class="draft-actions">
          <button class="btn ghost" type="button" :disabled="!canSaveCustom" @click="saveCustomBook">
            加入书目（本机保存）
          </button>
        </div>
      </div>
      <p v-else-if="currentBook" class="hint book-meta">
        {{ currentBook.author }}{{ currentBook.year ? ` · ${currentBook.year}` : '' }}
        <template v-if="currentBook.blurb"> — {{ currentBook.blurb }}</template>
      </p>
    </section>

    <section class="section">
      <div class="draft-actions">
        <button class="btn" @click="generate">生成知乎文章</button>
        <button class="btn ghost" @click="regenerateTitle" :disabled="!article">换个标题</button>
        <button class="btn ghost" @click="resetForm">重置</button>
      </div>
    </section>

    <section v-if="article" class="section output">
      <h2 class="section-title">5. 输出（可直接粘贴知乎）</h2>

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
const STORAGE_KEY = 'puzzle-writing-books';

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
  },
  {
    id: 'mine',
    name: '我的书目',
    desc: '你自己加入的书，保存在本机。'
  }
];

const BUILTIN_BOOKS = [
  {
    id: 'honglou',
    category: 'four',
    title: '红楼梦',
    author: '曹雪芹',
    year: '清代',
    blurb: '家族兴衰与少女命运交织。',
    topics: ['红楼梦', '经典名著', '读书', '中国文学', '小说']
  },
  {
    id: 'sanguo',
    category: 'four',
    title: '三国演义',
    author: '罗贯中',
    year: '元末明初',
    blurb: '乱世英雄与权谋忠义。',
    topics: ['三国演义', '经典名著', '历史小说', '读书', '人物评价']
  },
  {
    id: 'xiyou',
    category: 'four',
    title: '西游记',
    author: '吴承恩',
    year: '明代',
    blurb: '取经表层下是规则与自我。',
    topics: ['西游记', '经典名著', '神话', '读书', '文学解读']
  },
  {
    id: 'shuihu',
    category: 'four',
    title: '水浒传',
    author: '施耐庵',
    year: '元末明初',
    blurb: '逼上梁山的群像史诗。',
    topics: ['水浒传', '经典名著', '读书', '中国文学', '社会']
  },
  {
    id: 'weicheng',
    category: 'modern-cn',
    title: '围城',
    author: '钱钟书',
    year: '1947',
    blurb: '婚姻、留学与知识分子的体面窘迫。',
    topics: ['围城', '钱钟书', '经典名著', '读书', '知识分子']
  },
  {
    id: 'huozhe',
    category: 'modern-cn',
    title: '活着',
    author: '余华',
    year: '1993',
    blurb: '克制叙述下的苦难与活着本身。',
    topics: ['活着', '余华', '经典名著', '读书', '人生']
  },
  {
    id: '1984',
    category: 'world',
    title: '1984',
    author: '乔治·奥威尔',
    year: '1949',
    blurb: '监视、语言与真理被改写。',
    topics: ['1984', '奥威尔', '反乌托邦', '经典名著', '读书']
  },
  {
    id: 'baiye',
    category: 'world',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    year: '1967',
    blurb: '马孔多循环与拉丁美洲的孤独。',
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

const SCORE_OPTIONS = [9.5, 9, 8.5, 8, 7.5, 7, 6, 5, 4];

const ONE_LINER_OPTIONS = [
  { id: 'wake', label: '被生活打醒才读懂', text: '读完才懂：所谓清醒，有多残酷' },
  { id: 'mirror', label: '像一面刺人的镜子', text: '它不像故事，更像一面把你照穿的镜子' },
  { id: 'overrated', label: '神作光环下说实话', text: '被夸过头了吗？我的真实评分在这里' },
  { id: 'still', label: '今天一点没过时', text: '放到当下看，才发现它一点都没过时' },
  { id: 'quiet', label: '越平静越狠', text: '越平静的句子，越像一记闷拳' },
  { id: 'none', label: '不用钩子（模板标题）', text: '' }
];

const CONTEXT_OPTIONS = [
  { id: 'school', label: '学生时代硬读', text: '学生时代硬着头皮读完的，当时只追情节，很多地方其实没读懂。' },
  { id: 'reread-job', label: '离职/转岗后重读', text: '离职那天重读，忽然觉得以前当情节看的东西，全是规则与体面。' },
  { id: 'breakup', label: '情绪低谷时读', text: '情绪低谷时翻开，第一次觉得书不像在讲别人，而在讲我当下的处境。' },
  { id: 'bored', label: '无聊随手翻', text: '无聊随手翻开，没打算认真读，结果被某一段拽住了。' },
  { id: 'recommend', label: '被安利/考试逼读', text: '被安利或考试逼着读的，预期虚高，开读前先带了一层滤镜。' },
  { id: 'skip', label: '不写情境', text: '' }
];

const HIGHLIGHT_OPTIONS = [
  { id: 'choice', label: '人物选择', text: '最打动我的不是金句，是人物在关键头怎么给自己找理由、做选择。' },
  { id: 'atmosphere', label: '气氛与细节', text: '最打动我的是气氛和细节：某一页的沉默、某个物件、某次对话的分寸。' },
  { id: 'structure', label: '结构与节奏', text: '最打动我的是结构：铺垫、对照、循环——读到后面才明白前面为什么那样写。' },
  { id: 'language', label: '语言与比喻', text: '最打动我的是语言：比喻准、句子短、笑完比哭还难受。' },
  { id: 'ending', label: '结局余味', text: '最打动我的是结局余味：合上书之后，脑子里仍停在那一页。' },
  { id: 'theme', label: '主题刺到现实', text: '最打动我的是主题刺到现实：职场、关系、秩序——很多桥段换了皮肤还在。' }
];

const CHARACTER_OPTIONS = [
  { id: 'protag', label: '主角软肋', text: '最难忘的是主角：能力不差，但软肋和体面才是真正的戏。' },
  { id: 'hate', label: '又恨又懂的人', text: '最绕不开的是那个又恨又懂的人——讨厌 TA 的选择，却懂 TA 为什么那样选。' },
  { id: 'side', label: '配角抢戏', text: '真正抢戏的是配角：出场不多，却把主线的残酷/温柔点透了。' },
  { id: 'group', label: '群像对比', text: '我更想聊群像：几个人对照着看，主题不用喊，自己会站出来。' },
  { id: 'skip', label: '不单写人物', text: '' }
];

const FLAW_OPTIONS = [
  { id: 'pace', label: '节奏拖沓', text: '槽点很实在：中段节奏拖沓，耐心不够的人很容易劝退。' },
  { id: 'flat', label: '人物扁平', text: '有些人物写得偏扁，符号化一强，代入感就会掉。' },
  { id: 'translate', label: '译本/文言门槛', text: '门槛不低：文言、译本或叙事习惯，都会让一部分读者中途放弃。' },
  { id: 'myth', label: '被过度神话', text: '最大争议是被过度神话：社交货币和名人安利，把预期推得太高。' },
  { id: 'length', label: '太长难啃', text: '太长、线索多，第一次读很容易迷失，需要「合适的打开方式」。' },
  { id: 'skip', label: '暂不挑刺', text: '' }
];

const MISREAD_OPTIONS = [
  { id: 'love', label: '别只当爱情故事', text: '常见误读是只当爱情故事。其实更狠的是秩序、体面、家族/社会规则怎么碾人。' },
  { id: 'quote', label: '别只记一句金句', text: '别只记住那句名言。金句好传播，却常把复杂裁成顺口溜。' },
  { id: 'moral', label: '别急着道德审判', text: '别急着用道德审判人物。先看 TA 面对什么规则，再谈对错更公平。' },
  { id: 'outdated', label: '别说过时无用', text: '有人说过时。把职场、关系、舆论换上去看，很多戏码一点没老。' },
  { id: 'must', label: '别被「必读」绑架', text: '别被「必读」绑架。经典值得读，但不等于你此刻必须读完、读懂、读出深刻。' },
  { id: 'skip', label: '不纠正误读', text: '' }
];

const TAKEAWAY_OPTIONS = [
  { id: 'judge', label: '少用道德审判', text: '少用道德审判别人；先分清规则和人情，再谈对错。' },
  { id: 'ordinary', label: '允许自己普通', text: '允许自己普通地活着——不是所有选择都要被写成励志。' },
  { id: 'rule', label: '看清规则再行动', text: '遇事先看清规则再行动；硬刚时代/系统，往往先伤自己。' },
  { id: 'reread-self', label: '重读是在读自己', text: '重读往往不是更懂情节，而是更懂自己当年为什么没看懂。' },
  { id: 'no-worship', label: '少膜拜多对照', text: '少一点膜拜，多一点对照——名著有用时，往往是它戳中你正在过的日子。' },
  { id: 'skip', label: '不写带走句', text: '' }
];

const AUDIENCE_OPTIONS = [
  { id: 'burnout', label: '职场内耗的人', text: '刚经历职场内耗、需要被「说中」的人' },
  { id: 'student', label: '高中生/大学生', text: '高中生、大学生，或第一次系统补经典的人' },
  { id: 'afraid', label: '怕经典枯燥的人', text: '想补经典却怕枯燥、需要一张「地图」的读者' },
  { id: 'rereader', label: '准备重读的人', text: '读过一遍、想带着问题重读的人' },
  { id: 'general', label: '不爱被必读绑架的人', text: '对经典感兴趣、又不想被「必读」绑架的读者' }
];

const DETAIL_OPTIONS = [
  { id: 'scene', label: '关键场景', text: '某个关键场景：选择发生的那一刻，比任何总结都更锋利。' },
  { id: 'line', label: '一句对白', text: '一句看似随意的对白，事后才发现是全书的伏笔。' },
  { id: 'object', label: '一个物件', text: '一个反复出现的物件/意象，把情绪钉在具体处，而不是口号里。' },
  { id: 'contrast', label: '前后对照', text: '前后对照一出来，人物变了，读者也变了——这才是重读的快感。' },
  { id: 'silence', label: '留白与沉默', text: '作者不写破的地方往往最狠：沉默、省略、一笔带过，反而更刺。' }
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

function loadCustomBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter(b => b && b.id && b.title) : [];
  } catch {
    return [];
  }
}

function persistCustomBooks(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function slugId(title) {
  const base = String(title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .slice(0, 24) || 'book';
  return `custom-${base}-${Date.now().toString(36)}`;
}

function optionText(list, id) {
  const hit = list.find(o => o.id === id);
  return hit ? (hit.text || '') : '';
}

function scoreLabel(score) {
  if (score >= 9) return '强烈推荐，值得反复读';
  if (score >= 7.5) return '值得一读，瑕不掩瑜';
  if (score >= 6) return '可读，但要带着判断力';
  if (score >= 4) return '有启发，但体验割裂';
  return '个人向不太契合，仅供参考';
}

function pickTitle(angleId, book, oneLiner, titleIndex) {
  const list = TITLE_TEMPLATES[angleId] || TITLE_TEMPLATES.reread;
  const fn = list[titleIndex % list.length];
  const raw = (oneLiner || '').trim();
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
      ? `与其空谈「深刻」，我更想先聊这个人：${char}`
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
      builtinBooks: BUILTIN_BOOKS,
      customBooks: loadCustomBooks(),
      categories: CATEGORIES,
      angles: ANGLES,
      scoreOptions: SCORE_OPTIONS,
      oneLinerOptions: ONE_LINER_OPTIONS,
      contextOptions: CONTEXT_OPTIONS,
      highlightOptions: HIGHLIGHT_OPTIONS,
      characterOptions: CHARACTER_OPTIONS,
      flawOptions: FLAW_OPTIONS,
      misreadOptions: MISREAD_OPTIONS,
      takeawayOptions: TAKEAWAY_OPTIONS,
      audienceOptions: AUDIENCE_OPTIONS,
      detailOptions: DETAIL_OPTIONS,
      categoryId: CATEGORIES[0].id,
      angleId: ANGLES[0].id,
      score: 8,
      oneLinerId: ONE_LINER_OPTIONS[0].id,
      contextId: CONTEXT_OPTIONS[0].id,
      highlightId: HIGHLIGHT_OPTIONS[0].id,
      characterId: CHARACTER_OPTIONS[0].id,
      flawId: FLAW_OPTIONS[0].id,
      misreadId: MISREAD_OPTIONS[0].id,
      takeawayId: TAKEAWAY_OPTIONS[0].id,
      audienceId: AUDIENCE_OPTIONS[0].id,
      detailIds: [],
      bookId: BUILTIN_BOOKS[0].id,
      bookSearch: '',
      customTitle: '',
      customAuthor: '',
      customYear: '',
      article: null,
      titleIndex: 0
    };
  },
  computed: {
    books() {
      return [...this.builtinBooks, ...this.customBooks];
    },
    currentCategory() {
      return this.categories.find(c => c.id === this.categoryId) || this.categories[0];
    },
    filteredBooks() {
      const q = (this.bookSearch || '').trim().toLowerCase();
      let list = this.books;
      if (this.categoryId === 'mine') {
        list = list.filter(b => b.custom);
      } else {
        list = list.filter(b => b.category === this.categoryId);
      }
      if (!q) return list;
      return list.filter(b => {
        const hay = `${b.title} ${b.author || ''} ${b.blurb || ''}`.toLowerCase();
        return hay.includes(q);
      });
    },
    canSaveCustom() {
      return Boolean((this.customTitle || '').trim());
    },
    currentBook() {
      if (this.bookId === 'custom') {
        const title = (this.customTitle || '').trim() || '未命名名著';
        return {
          id: 'custom',
          title,
          author: (this.customAuthor || '').trim() || '佚名',
          year: (this.customYear || '').trim(),
          blurb: '',
          topics: ['经典名著', '读书', '书评', '文学', title].filter(Boolean)
        };
      }
      return this.books.find(b => b.id === this.bookId) || this.filteredBooks[0] || this.books[0];
    },
    currentAngle() {
      return this.angles.find(a => a.id === this.angleId) || this.angles[0];
    },
    resolvedViews() {
      return {
        oneLiner: optionText(ONE_LINER_OPTIONS, this.oneLinerId),
        context: optionText(CONTEXT_OPTIONS, this.contextId),
        highlight: optionText(HIGHLIGHT_OPTIONS, this.highlightId),
        character: optionText(CHARACTER_OPTIONS, this.characterId),
        flaw: optionText(FLAW_OPTIONS, this.flawId),
        misread: optionText(MISREAD_OPTIONS, this.misreadId),
        takeaway: optionText(TAKEAWAY_OPTIONS, this.takeawayId),
        audience: optionText(AUDIENCE_OPTIONS, this.audienceId),
        quoteLines: DETAIL_OPTIONS
          .filter(o => this.detailIds.includes(o.id))
          .map(o => o.text)
      };
    }
  },
  methods: {
    selectCategory(id) {
      if (id === this.categoryId) return;
      this.categoryId = id;
      this.bookSearch = '';
      if (id === 'mine') {
        const first = this.customBooks[0];
        this.bookId = first ? first.id : 'custom';
        return;
      }
      const first = this.books.find(b => b.category === id);
      this.bookId = first ? first.id : 'custom';
    },
    selectBook(id) {
      this.bookId = id;
    },
    toggleDetail(id) {
      if (this.detailIds.includes(id)) {
        this.detailIds = this.detailIds.filter(x => x !== id);
      } else {
        this.detailIds = [...this.detailIds, id];
      }
    },
    saveCustomBook() {
      const title = (this.customTitle || '').trim();
      if (!title) {
        alert('请填写书名');
        return;
      }
      const author = (this.customAuthor || '').trim() || '佚名';
      const year = (this.customYear || '').trim();
      const targetCategory = this.categoryId === 'mine' ? 'modern-cn' : this.categoryId;
      const dup = this.books.find(
        b => b.title === title && (b.author || '') === author
      );
      if (dup) {
        this.bookId = dup.id;
        alert(dup.custom ? '书目里已有，已选中' : '内置书目已有，已选中');
        return;
      }
      const book = {
        id: slugId(title),
        category: targetCategory,
        title,
        author,
        year,
        blurb: `《${title}》——你加入书目的一本。`,
        topics: [title, author, '经典名著', '读书', '书评'].filter(Boolean),
        custom: true
      };
      this.customBooks = [...this.customBooks, book];
      persistCustomBooks(this.customBooks);
      this.bookId = book.id;
      if (this.categoryId !== 'mine') this.categoryId = book.category;
      this.customTitle = '';
      this.customAuthor = '';
      this.customYear = '';
    },
    removeCustomBook(id) {
      this.customBooks = this.customBooks.filter(b => b.id !== id);
      persistCustomBooks(this.customBooks);
      if (this.bookId === id) {
        const first = this.filteredBooks[0];
        this.bookId = first ? first.id : 'custom';
      }
    },
    buildArticle() {
      if (this.bookId === 'custom' && !(this.customTitle || '').trim()) {
        alert('请填写书名');
        return null;
      }
      const book = this.currentBook;
      const angle = this.currentAngle;
      const views = this.resolvedViews;
      const title = pickTitle(this.angleId, book, views.oneLiner, this.titleIndex);
      const body = buildBody({
        book,
        angle,
        score: this.score,
        oneLiner: views.oneLiner,
        context: views.context,
        highlight: views.highlight,
        character: views.character,
        flaw: views.flaw,
        misread: views.misread,
        takeaway: views.takeaway,
        audience: views.audience,
        quoteLines: views.quoteLines
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
      this.angleId = ANGLES[0].id;
      this.score = 8;
      this.oneLinerId = ONE_LINER_OPTIONS[0].id;
      this.contextId = CONTEXT_OPTIONS[0].id;
      this.highlightId = HIGHLIGHT_OPTIONS[0].id;
      this.characterId = CHARACTER_OPTIONS[0].id;
      this.flawId = FLAW_OPTIONS[0].id;
      this.misreadId = MISREAD_OPTIONS[0].id;
      this.takeawayId = TAKEAWAY_OPTIONS[0].id;
      this.audienceId = AUDIENCE_OPTIONS[0].id;
      this.detailIds = [];
      this.article = null;
      this.titleIndex = 0;
      this.customTitle = '';
      this.customAuthor = '';
      this.customYear = '';
      this.bookSearch = '';
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

.book-meta {
  margin-top: 10px;
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

.book-row {
  margin-top: 8px;
}

.book-chip.custom {
  border-style: dashed;
}

.chip-del {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  font-size: 0.85em;
  line-height: 1;
  opacity: 0.7;
}

.chip-del:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.12);
}

.chip.active .chip-del:hover {
  background: rgba(255, 255, 255, 0.25);
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

.text-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
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
