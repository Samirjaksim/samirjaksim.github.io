/* ==========================================================================
   🎮 [주방장 전용 난이도 프리셋 & 글로벌 밸런스 제어판]
   ========================================================================== */
const DIFFICULTIES = {
  EASY: {
    name: 'EASY',
    badge: '[EASY]',
    badgeColor: '#2ed573',
    desc: '4키 요리 제외, 얼음 2타, 6라이프의 힐링 주방!',
    INITIAL_LIVES: 6,         // ❤️ 6개
    MAX_RECIPE_TIER: 3,       // 💡 4티어 요리 과감히 제외!
    BASE_SPEED: 36,
    MAX_SPEED_BONUS: 40,
    SPAWN_INTERVAL_BASE: 2200,
    SPAWN_INTERVAL_MIN: 1100,
    HELLFIRE_SPEED_MULT: 1.5,
    DOUBLE_SPEED_MULT: 0.6,
    FROZEN_SPEED_MULT: 0.8,
    BOMB_SPEED: 26,
    VIP_SPEED: 22,
    FROZEN_HITS: 2,           // ❄️ 얼음 2타 해동!
    BOMB_KEY_COUNT: 4,        // ⚡ EMP 4단
    VIP_KEY_COUNT: 6,         // 👿 진상 6단
    MAX_SET_SIZE: 2
  },
  NORMAL: {
    name: 'NORMAL',
    badge: '[NORMAL]',
    badgeColor: '#54a0ff',
    desc: '4키 요리 제외, 하드와 동일한 스피드의 5라이프 표준 주방!',
    INITIAL_LIVES: 5,         // ❤️ 5개
    MAX_RECIPE_TIER: 3,       // 💡 4티어 요리 과감히 제외!
    // 잡다한 속도/스폰 세팅은 하드와 100% 동일하게 일치!
    BASE_SPEED: 44,
    MAX_SPEED_BONUS: 55,
    SPAWN_INTERVAL_BASE: 1850,
    SPAWN_INTERVAL_MIN: 850,
    HELLFIRE_SPEED_MULT: 1.8,
    DOUBLE_SPEED_MULT: 0.6,
    FROZEN_SPEED_MULT: 0.8,
    BOMB_SPEED: 33,
    VIP_SPEED: 28,
    FROZEN_HITS: 3,
    BOMB_KEY_COUNT: 6,
    VIP_KEY_COUNT: 8,
    MAX_SET_SIZE: 2
  },
  HARD: {
    name: 'HARD',
    badge: '[HARD]',
    badgeColor: '#ff9f43',
    desc: '16종 요리 완비, 4라이프의 긴장감 넘치는 매운맛 주방!',
    INITIAL_LIVES: 4,         // ❤️ 4개로 조정!
    MAX_RECIPE_TIER: 4,       // 16종 전체 해금
    BASE_SPEED: 44,
    MAX_SPEED_BONUS: 55,
    SPAWN_INTERVAL_BASE: 1850,
    SPAWN_INTERVAL_MIN: 850,
    HELLFIRE_SPEED_MULT: 1.8,
    DOUBLE_SPEED_MULT: 0.6,
    FROZEN_SPEED_MULT: 0.8,
    BOMB_SPEED: 33,
    VIP_SPEED: 28,
    FROZEN_HITS: 3,
    BOMB_KEY_COUNT: 6,
    VIP_KEY_COUNT: 8,
    MAX_SET_SIZE: 2
  },
  SUPER_HARD: {
    name: 'SUPER_HARD',
    badge: '[SUPER HARD]',
    badgeColor: '#ff4757',
    desc: '가끔 3단 세트, 10단 진상, 8단 EMP, 3라이프 극한 지옥!',
    INITIAL_LIVES: 3,         // ❤️ 3개로 조정!
    MAX_RECIPE_TIER: 4,       // 16종 전체 해금
    BASE_SPEED: 50,
    MAX_SPEED_BONUS: 65,
    SPAWN_INTERVAL_BASE: 1600,
    SPAWN_INTERVAL_MIN: 750,
    HELLFIRE_SPEED_MULT: 2.0,
    DOUBLE_SPEED_MULT: 0.6,
    FROZEN_SPEED_MULT: 0.8,
    BOMB_SPEED: 36,
    VIP_SPEED: 32,
    FROZEN_HITS: 3,
    BOMB_KEY_COUNT: 8,        // ⚡ EMP 8단
    VIP_KEY_COUNT: 10,        // 👿 진상 10단 대마왕
    MAX_SET_SIZE: 3           // 3단 세트 출현 가능
  }
};

const GLOBAL_CONFIG = {
  CHANCE: {
    HELLFIRE: 0.08,
    FROZEN: 0.08,
    DOUBLE: 0.08,
    BOMB: 0.08,
    VIP: 0.075
  },
  COOLDOWN: {
    BOMB_MS: 30000,
    VIP_MS: 40000
  },
  UNLOCK_REQ: {
    HELLFIRE_SCORE: 80,
    FROZEN_SCORE: 550,
    DOUBLE_SCORE: 2300,
    BOMB_SCORE: 550,
    VIP_SCORE: 5700
  },
  SCORE: {
    BOMB_BASE: 350,
    BOMB_PER_ENEMY: 90,
    VIP_BASE: 1200,
    DOUBLE_FINISH: 350,
    FROZEN_FINISH: 260,
    HELLFIRE_BONUS: 80
  },
  ENDLESS: {
    STEP_SCORE: 10000,
    SPEED_BOOST_PER_STEP: 6
  }
};

/* ==========================================================================
   📖 16종 요리 레시피
   ========================================================================== */
const ALL_RECIPES = [
  { id: 'pizza', name: '피자', emoji: '🍕', tier: 1, keys: ['ArrowLeft', 'Space'], labels: ['◀', 'Space'], unlockScore: 0 },
  { id: 'chicken', name: '치킨', emoji: '🍗', tier: 1, keys: ['ArrowRight', 'Space'], labels: ['▶', 'Space'], unlockScore: 0 },
  { id: 'burger', name: '버거', emoji: '🍔', tier: 1, keys: ['ArrowUp', 'Space'], labels: ['▲', 'Space'], unlockScore: 120 },
  { id: 'fries', name: '감자튀김', emoji: '🍟', tier: 1, keys: ['ArrowDown', 'Space'], labels: ['▼', 'Space'], unlockScore: 280 },

  { id: 'hotdog', name: '핫도그', emoji: '🌭', tier: 2, keys: ['ArrowLeft', 'ArrowRight', 'Space'], labels: ['◀', '▶', 'Space'], unlockScore: 550 },
  { id: 'taco', name: '타코', emoji: '🌮', tier: 2, keys: ['ArrowUp', 'ArrowDown', 'Space'], labels: ['▲', '▼', 'Space'], unlockScore: 900 },
  { id: 'ramen', name: '라면', emoji: '🍜', tier: 2, keys: ['ArrowDown', 'ArrowRight', 'Space'], labels: ['▼', '▶', 'Space'], unlockScore: 1300 },
  { id: 'dumpling', name: '만두', emoji: '🥟', tier: 2, keys: ['ArrowLeft', 'ArrowUp', 'Space'], labels: ['◀', '▲', 'Space'], unlockScore: 1750 },

  { id: 'sushi', name: '초밥', emoji: '🍣', tier: 3, keys: ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'Space'], labels: ['◀', '▲', '▶', 'Space'], unlockScore: 2300 },
  { id: 'cake', name: '케이크', emoji: '🍰', tier: 3, keys: ['ArrowUp', 'ArrowDown', 'ArrowUp', 'Space'], labels: ['▲', '▼', '▲', 'Space'], unlockScore: 3000 },
  { id: 'steak', name: '스테이크', emoji: '🥩', tier: 3, keys: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'Space'], labels: ['▶', '▼', '◀', 'Space'], unlockScore: 3800 },
  { id: 'pasta', name: '파스타', emoji: '🍝', tier: 3, keys: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'Space'], labels: ['◀', '▶', '◀', 'Space'], unlockScore: 4700 },

  { id: 'lobster', name: '랍스터', emoji: '🦞', tier: 4, keys: ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'Space'], labels: ['▲', '▶', '▼', '◀', 'Space'], unlockScore: 5700 },
  { id: 'sinseollo', name: '궁중신선로', emoji: '🍲', tier: 4, keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'Space'], labels: ['▲', '▲', '▼', '▼', 'Space'], unlockScore: 6900 },
  { id: 'paella', name: '해물빠에야', emoji: '🥘', tier: 4, keys: ['ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight', 'Space'], labels: ['◀', '◀', '▶', '▶', 'Space'], unlockScore: 8200 },
  { id: 'dragon', name: '용왕특식', emoji: '🐉', tier: 4, keys: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space'], labels: ['▲', '◀', '▼', '▶', 'Space'], unlockScore: 9600 }
];

const ARROW_KEY_MAP = {
  'ArrowLeft': '◀',
  'ArrowRight': '▶',
  'ArrowUp': '▲',
  'ArrowDown': '▼'
};

function getKeyClass(label) {
  if (label === '◀') return 'left';
  if (label === '▶') return 'right';
  if (label === '▲') return 'up';
  if (label === '▼') return 'down';
  if (label === 'Space') return 'space';
  return '';
}

/* ==========================================================================
   🔊 Web Audio 사운드
   ========================================================================== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.15) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const Sound = {
  keyPress: () => playTone(580, 'triangle', 0.04, 0.08),
  serveSuccess: () => {
    playTone(523.25, 'sine', 0.06, 0.2);
    setTimeout(() => playTone(659.25, 'sine', 0.06, 0.2), 45);
    setTimeout(() => playTone(783.99, 'sine', 0.1, 0.2), 90);
  },
  stepSuccess: () => {
    playTone(659.25, 'triangle', 0.06, 0.2);
    setTimeout(() => playTone(880, 'triangle', 0.09, 0.2), 50);
  },
  iceHit: () => {
    playTone(1200, 'triangle', 0.04, 0.2);
    setTimeout(() => playTone(1600, 'sine', 0.05, 0.2), 25);
  },
  iceShatter: () => {
    playTone(900, 'triangle', 0.06, 0.25);
    setTimeout(() => playTone(1300, 'sine', 0.08, 0.25), 40);
    setTimeout(() => playTone(1750, 'sine', 0.12, 0.2), 80);
  },
  vipServe: () => {
    playTone(523.25, 'triangle', 0.08, 0.25);
    setTimeout(() => playTone(659.25, 'triangle', 0.08, 0.25), 80);
    setTimeout(() => playTone(783.99, 'triangle', 0.08, 0.25), 160);
    setTimeout(() => playTone(1046.50, 'triangle', 0.25, 0.3), 240);
  },
  vipAlert: () => {
    playTone(320, 'sawtooth', 0.12, 0.2);
    setTimeout(() => playTone(480, 'sawtooth', 0.18, 0.2), 120);
  },
  bombAlert: () => {
    playTone(700, 'sine', 0.08, 0.2);
    setTimeout(() => playTone(950, 'triangle', 0.12, 0.2), 60);
  },
  miss: () => playTone(150, 'sawtooth', 0.12, 0.15),
  damage: (double = false) => {
    playTone(75, 'square', double ? 0.35 : 0.2, double ? 0.4 : 0.25);
  },
  bombExplosion: () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 0.6;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(35, audioCtx.currentTime + 0.6);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.55, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  }
};

/* ==========================================================================
   🎮 게임 상태 및 활성 난이도
   ========================================================================== */
let selectedDifficulty = 'HARD';
let activeDiff = DIFFICULTIES.HARD;

let isPlaying = false;
let score = 0;
let combo = 0;
let lives = 4;
let orders = [];
let inputBuffer = [];
let spawnTimer = null;
let lastBombSpawnTime = 0;
let lastVipSpawnTime = 0;
let lastFrameTime = performance.now();
let lastSpawnedTier = 0;
let lastOverclockMilestone = 0;

const playfield = document.getElementById('playfield');
const flashOverlay = document.getElementById('flash-overlay');
const recipesListEl = document.getElementById('recipes-list');
const inputBufferEl = document.getElementById('input-buffer');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const heartsEl = document.getElementById('hearts');
const diffBadgeEl = document.getElementById('diff-badge');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');
const gameOverDiffEl = document.getElementById('game-over-diff');
const diffDescEl = document.getElementById('diff-desc');

/* ==========================================================================
   🎛️ 난이도 선택 이벤트 리스너
   ========================================================================== */
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDifficulty = btn.dataset.diff;
    activeDiff = DIFFICULTIES[selectedDifficulty];
    diffDescEl.textContent = activeDiff.desc;
    diffBadgeEl.textContent = activeDiff.badge;
    diffBadgeEl.style.color = activeDiff.badgeColor;
    renderRecipeBook();
    Sound.keyPress();
  });
});

/* ==========================================================================
   🖥️ UI 렌더링 (난이도별 허용 티어만 깔끔하게 렌더링!)
   ========================================================================== */
function renderRecipeBook() {
  if (!recipesListEl) return;
  recipesListEl.innerHTML = '';
  const tiers = [
    { tier: 1, title: 'TIER 1 (1 KEY)' },
    { tier: 2, title: 'TIER 2 (2 KEYS)' },
    { tier: 3, title: 'TIER 3 (3 KEYS)' },
    { tier: 4, title: 'TIER 4 (4 KEYS)' }
  ];

  // 💡 이지/노말에서는 4티어 요리를 족보에서도 깔끔히 제외!
  const allowedTiers = tiers.filter(t => t.tier <= activeDiff.MAX_RECIPE_TIER);

  allowedTiers.forEach(t => {
    const groupTitle = document.createElement('div');
    groupTitle.className = 'tier-group-title';
    groupTitle.textContent = t.title;
    recipesListEl.appendChild(groupTitle);

    const tierRecipes = ALL_RECIPES.filter(r => r.tier === t.tier);
    tierRecipes.forEach(recipe => {
      const isUnlocked = score >= recipe.unlockScore;
      const card = document.createElement('div');
      card.className = `recipe-card ${isUnlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <span>${recipe.emoji} ${recipe.name}</span>
        <span style="font-size: 10px; color: ${isUnlocked ? '#2ed573' : '#ff7675'};">
          ${isUnlocked ? 'OPEN' : `${recipe.unlockScore}P`}
        </span>
      `;
      recipesListEl.appendChild(card);
    });
  });
}

function renderInputBuffer() {
  if (inputBuffer.length === 0) {
    inputBufferEl.innerHTML = `<span style="color: #64748b; font-size: 13px;">커맨드 입력 후 [SPACE]!</span>`;
    return;
  }
  inputBufferEl.innerHTML = inputBuffer.map(k => {
    let label = k;
    if (k === 'ArrowLeft') label = '◀';
    if (k === 'ArrowRight') label = '▶';
    if (k === 'ArrowUp') label = '▲';
    if (k === 'ArrowDown') label = '▼';
    if (k === 'Space') label = 'SPACE';
    const cls = getKeyClass(label);
    return `<span class="current-key mini-key ${cls}">${label}</span>`;
  }).join('');
}

function updateHUD() {
  scoreEl.textContent = score;
  comboEl.textContent = `${combo}x`;
  const safeLives = Math.max(0, Math.min(activeDiff.INITIAL_LIVES, lives));
  heartsEl.textContent = '❤️'.repeat(safeLives);
}

function showFloatingText(text, x, y, color = '#ffcc00') {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  el.textContent = text;
  playfield.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function triggerScreenShake() {
  playfield.classList.add('screen-shake');
  setTimeout(() => playfield.classList.remove('screen-shake'), 250);
}

/* ==========================================================================
   📦 주문 스폰 (이지/노말 4티어 제외 & 슈하 3단 1/3 조정)
   ========================================================================== */
function getAvailableRecipes() {
  // 💡 현재 난이도의 MAX_RECIPE_TIER 이하 요리만 출현!
  return ALL_RECIPES.filter(r => score >= r.unlockScore && r.tier <= activeDiff.MAX_RECIPE_TIER);
}

function pickSmartRecipe() {
  let available = getAvailableRecipes();
  if (lastSpawnedTier === 4) {
    const nonTier4 = available.filter(r => r.tier < 4);
    if (nonTier4.length > 0) available = nonTier4;
  }
  const picked = available[Math.floor(Math.random() * available.length)];
  lastSpawnedTier = picked.tier;
  return picked;
}

function generateRandomRecipe(count) {
  const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  const keys = [];
  const labels = [];
  for (let i = 0; i < count; i++) {
    const randKey = arrowKeys[Math.floor(Math.random() * arrowKeys.length)];
    keys.push(randKey);
    labels.push(ARROW_KEY_MAP[randKey]);
  }
  keys.push('Space');
  labels.push('Space');
  return { keys, labels };
}

function updateDoubleBubble(order) {
  const currentRecipe = order.subOrders[0];
  const nextRecipe = order.subOrders[1];
  const isTriple = order.totalSetSize === 3;
  if (isTriple) order.el.classList.add('triple');

  order.el.innerHTML = `
    <div class="order-bubble">
      <div class="order-header">
        <span class="emoji">${currentRecipe.emoji}</span>
        <span>${currentRecipe.name}</span>
        <span class="double-badge">${order.totalSetSize}단 세트 (${order.totalSetSize - order.subOrders.length + 1}/${order.totalSetSize})</span>
      </div>
      <div class="order-command">
        ${currentRecipe.labels.map(l => `<span class="mini-key ${getKeyClass(l)}">${l === 'Space' ? 'SPACE' : l}</span>`).join('')}
      </div>
      ${nextRecipe ? `<div class="next-dish-hint">다음: ${nextRecipe.emoji} ${nextRecipe.name}</div>` : ''}
    </div>
  `;
}

function updateFrozenBubble(order) {
  const recipe = order.recipeObj;
  let keysHtml = '';
  for (let i = 0; i < order.totalHits; i++) {
    const isBroken = i >= order.hitsRemaining;
    keysHtml += `<span class="mini-key space ice-key ${isBroken ? 'broken' : ''}">${isBroken ? '깨짐' : 'SPACE'}</span>`;
  }

  order.el.innerHTML = `
    <div class="order-bubble">
      <div class="order-header">
        <span class="emoji">${recipe.emoji}</span>
        <span style="color:#1e90ff;">냉동 ${recipe.name}</span>
        <span class="frozen-badge">❄️(${order.hitsRemaining}/${order.totalHits})</span>
      </div>
      <div class="order-command">${keysHtml}</div>
    </div>
  `;
}

function updateThawedBubble(order) {
  const recipe = order.recipeObj;
  order.el.className = 'order-entity thawed';
  order.el.innerHTML = `
    <div class="order-bubble">
      <div class="order-header">
        <span class="emoji">${recipe.emoji}</span>
        <span style="color:#0984e3;">해동 ${recipe.name}</span>
        <span class="frozen-badge" style="background:#0984e3;">✨조리대기</span>
      </div>
      <div class="order-command">
        ${recipe.labels.map(l => `<span class="mini-key ${getKeyClass(l)}">${l === 'Space' ? 'SPACE' : l}</span>`).join('')}
      </div>
    </div>
  `;
}

function spawnOrder() {
  if (!isPlaying) return;

  const fieldWidth = playfield.clientWidth;
  const x = Math.floor(Math.random() * (fieldWidth - 180)) + 90;

  const endlessBoost = Math.floor(score / GLOBAL_CONFIG.ENDLESS.STEP_SCORE) * GLOBAL_CONFIG.ENDLESS.SPEED_BOOST_PER_STEP;
  const baseSpeed = activeDiff.BASE_SPEED + Math.min(score * 0.012, activeDiff.MAX_SPEED_BONUS) + endlessBoost;

  // 1. 👿 진상 손님
  const hasVip = orders.some(o => o.type === 'vip');
  const canSpawnVip = (score >= GLOBAL_CONFIG.UNLOCK_REQ.VIP_SCORE) && (!hasVip) && (Date.now() - lastVipSpawnTime > GLOBAL_CONFIG.COOLDOWN.VIP_MS);
  const isVip = canSpawnVip && (Math.random() < GLOBAL_CONFIG.CHANCE.VIP);

  if (isVip) {
    lastVipSpawnTime = Date.now();
    lastSpawnedTier = 0;
    Sound.vipAlert();
    const vipData = generateRandomRecipe(activeDiff.VIP_KEY_COUNT);

    const el = document.createElement('div');
    el.className = 'order-entity vip';
    el.innerHTML = `
      <div class="order-bubble">
        <div class="order-header">
          <span class="emoji">👿</span>
          <span>진상 손님</span>
          <span class="vip-badge">${activeDiff.VIP_KEY_COUNT}단</span>
        </div>
        <div class="order-command">
          ${vipData.labels.map(l => `<span class="mini-key ${getKeyClass(l)}">${l === 'Space' ? 'SPACE' : l}</span>`).join('')}
        </div>
      </div>
    `;
    playfield.appendChild(el);

    orders.push({
      id: Date.now() + Math.random(),
      type: 'vip',
      recipeKeys: vipData.keys,
      x: x,
      y: -50,
      speed: activeDiff.VIP_SPEED,
      el: el
    });

    showFloatingText(`⚠️ 진상 손님 출현!! (${activeDiff.VIP_KEY_COUNT}단)`, fieldWidth / 2, 70, '#a55eea');

  } else {
    // 2. ⚡ EMP 올킬 폭탄
    const hasBomb = orders.some(o => o.type === 'bomb');
    const canSpawnBomb = (score >= GLOBAL_CONFIG.UNLOCK_REQ.BOMB_SCORE) && (!hasBomb) && (Date.now() - lastBombSpawnTime > GLOBAL_CONFIG.COOLDOWN.BOMB_MS);
    const isBomb = canSpawnBomb && (Math.random() < GLOBAL_CONFIG.CHANCE.BOMB);

    if (isBomb) {
      lastBombSpawnTime = Date.now();
      lastSpawnedTier = 0;
      Sound.bombAlert();
      const bombData = generateRandomRecipe(activeDiff.BOMB_KEY_COUNT);

      const el = document.createElement('div');
      el.className = 'order-entity bomb';
      el.innerHTML = `
        <div class="order-bubble">
          <div class="order-header">
            <span class="emoji">💣</span>
            <span>EMP 폭탄</span>
            <span class="bomb-badge">⚡${activeDiff.BOMB_KEY_COUNT}단</span>
          </div>
          <div class="order-command">
            ${bombData.labels.map(l => `<span class="mini-key ${getKeyClass(l)}">${l === 'Space' ? 'SPACE' : l}</span>`).join('')}
          </div>
        </div>
      `;
      playfield.appendChild(el);

      orders.push({
        id: Date.now() + Math.random(),
        type: 'bomb',
        recipeKeys: bombData.keys,
        x: x,
        y: -50,
        speed: activeDiff.BOMB_SPEED,
        el: el
      });

      showFloatingText(`⚡ EMP 폭탄!! (${activeDiff.BOMB_KEY_COUNT}단)`, fieldWidth / 2, 70, '#ffd32a');

    } else {
      const roll = Math.random();

      // 3. 🍱 세트 손님 (슈퍼하드 3단 세트는 딱 1/3 확률로만 출현!)
      if (roll < GLOBAL_CONFIG.CHANCE.DOUBLE && score >= GLOBAL_CONFIG.UNLOCK_REQ.DOUBLE_SCORE) {
        const isTriple = (activeDiff.MAX_SET_SIZE === 3 && Math.random() < 0.333);
        const subOrders = [pickSmartRecipe(), pickSmartRecipe()];
        if (isTriple) subOrders.push(pickSmartRecipe());

        const el = document.createElement('div');
        el.className = `order-entity double ${isTriple ? 'triple' : ''}`;
        playfield.appendChild(el);

        const doubleOrder = {
          id: Date.now() + Math.random(),
          type: 'double',
          subOrders: subOrders,
          totalSetSize: subOrders.length,
          x: x,
          y: -50,
          speed: baseSpeed * activeDiff.DOUBLE_SPEED_MULT,
          el: el
        };

        updateDoubleBubble(doubleOrder);
        orders.push(doubleOrder);

      } else if (roll < GLOBAL_CONFIG.CHANCE.DOUBLE + GLOBAL_CONFIG.CHANCE.FROZEN && score >= GLOBAL_CONFIG.UNLOCK_REQ.FROZEN_SCORE) {
        // 4. ❄️ 냉동 음식
        const recipe = pickSmartRecipe();
        const el = document.createElement('div');
        el.className = 'order-entity frozen';
        playfield.appendChild(el);

        const frozenOrder = {
          id: Date.now() + Math.random(),
          type: 'frozen',
          recipeId: recipe.id,
          recipeObj: recipe,
          totalHits: activeDiff.FROZEN_HITS,
          hitsRemaining: activeDiff.FROZEN_HITS,
          x: x,
          y: -45,
          speed: baseSpeed * activeDiff.FROZEN_SPEED_MULT,
          el: el
        };

        updateFrozenBubble(frozenOrder);
        orders.push(frozenOrder);

      } else if (roll < GLOBAL_CONFIG.CHANCE.DOUBLE + GLOBAL_CONFIG.CHANCE.FROZEN + GLOBAL_CONFIG.CHANCE.HELLFIRE && score >= GLOBAL_CONFIG.UNLOCK_REQ.HELLFIRE_SCORE) {
        // 5. 🔥 불지옥 급발진 음식
        const recipe = pickSmartRecipe();
        const el = document.createElement('div');
        el.className = 'order-entity hellfire';
        el.innerHTML = `
          <div class="order-bubble">
            <div class="order-header">
              <span class="emoji">${recipe.emoji}</span>
              <span style="color:#ff3f34;">불지옥 ${recipe.name}</span>
              <span class="hellfire-badge">🔥급발진</span>
            </div>
            <div class="order-command">
              ${recipe.labels.map(l => `<span class="mini-key ${getKeyClass(l)}">${l === 'Space' ? 'SPACE' : l}</span>`).join('')}
            </div>
          </div>
        `;
        playfield.appendChild(el);

        orders.push({
          id: Date.now() + Math.random(),
          type: 'hellfire',
          recipeId: recipe.id,
          recipeObj: recipe,
          x: x,
          y: -45,
          speed: baseSpeed * activeDiff.HELLFIRE_SPEED_MULT,
          el: el
        });

      } else {
        // 6. 일반 요리
        const recipe = pickSmartRecipe();
        const speedVariance = 0.8 + (Math.random() * 0.5);
        const speed = baseSpeed * speedVariance;

        const el = document.createElement('div');
        el.className = 'order-entity';
        el.innerHTML = `
          <div class="order-bubble">
            <div class="order-header">
              <span class="emoji">${recipe.emoji}</span>
              <span>${recipe.name}</span>
            </div>
            <div class="order-command">
              ${recipe.labels.map(l => `<span class="mini-key ${getKeyClass(l)}">${l === 'Space' ? 'SPACE' : l}</span>`).join('')}
            </div>
          </div>
        `;
        playfield.appendChild(el);

        orders.push({
          id: Date.now() + Math.random(),
          type: 'normal',
          recipeId: recipe.id,
          recipeObj: recipe,
          x: x,
          y: -45,
          speed: speed,
          el: el
        });
      }
    }
  }

  const nextInterval = Math.max(activeDiff.SPAWN_INTERVAL_MIN, activeDiff.SPAWN_INTERVAL_BASE - (score * 0.25));
  clearTimeout(spawnTimer);
  spawnTimer = setTimeout(spawnOrder, nextInterval);
}

/* ==========================================================================
   🔄 메인 프레임 루프
   ========================================================================== */
function gameLoop(now) {
  if (!isPlaying) return;

  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  const dangerThreshold = playfield.clientHeight - 20;

  for (let i = orders.length - 1; i >= 0; i--) {
    const ord = orders[i];
    ord.y += ord.speed * dt;
    ord.el.style.left = `${ord.x}px`;
    ord.el.style.top = `${ord.y}px`;
    ord.el.style.zIndex = Math.min(500, 10 + Math.floor(ord.y));

    if (ord.y >= dangerThreshold) {
      ord.el.remove();
      orders.splice(i, 1);

      if (ord.type === 'vip') {
        Sound.damage(true);
        triggerScreenShake();
        lives = Math.max(0, lives - 2);
        showFloatingText("진상 난동! HP -2!!", ord.x, dangerThreshold - 30, '#ff3838');
      } else {
        Sound.damage(false);
        triggerScreenShake();
        lives--;
        showFloatingText("침공 피격! -1 HP", ord.x, dangerThreshold - 25, '#ff4757');
      }

      combo = 0;
      updateHUD();

      if (lives <= 0) {
        gameOver();
        return;
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

/* ==========================================================================
   🕹️ 조작 엔진 (지우기 키 없이 오직 스페이스로 털어내는 오락실 룰!)
   ========================================================================== */
function processInputKey(code) {
  if (!isPlaying) return;

  if (navigator.vibrate) navigator.vibrate(14);

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
    if (inputBuffer.length < 11) {
      inputBuffer.push(code);
      Sound.keyPress();
      renderInputBuffer();
    }
  } else if (code === 'Space') {
    handleSpaceAction();
  }
}

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  processInputKey(e.code);
});

document.querySelectorAll('.dpad-btn').forEach(btn => {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const key = btn.dataset.key;
    if (key) processInputKey(key);
  });
});

function handleSpaceAction() {
  if (inputBuffer.length === 0) {
    const frozenTargets = orders
      .filter(o => o.type === 'frozen')
      .sort((a, b) => b.y - a.y);

    if (frozenTargets.length > 0) {
      const target = frozenTargets[0];
      target.hitsRemaining--;

      if (target.hitsRemaining <= 0) {
        Sound.iceShatter();
        showFloatingText(`🧊 해동 완료! 이제 조리!`, target.x, target.y - 15, '#0984e3');
        target.type = 'thawed';
        updateThawedBubble(target);
      } else {
        Sound.iceHit();
        showFloatingText(`🧊 쾅! (남은 타수: ${target.hitsRemaining})`, target.x, target.y - 10, '#70a1ff');
        updateFrozenBubble(target);
      }

      updateHUD();
      return;
    }
  }

  inputBuffer.push('Space');
  evaluateServe();
}

function evaluateServe() {
  // 1. 👿 진상 손님 판정
  const matchedVip = orders.find(ord => {
    if (ord.type !== 'vip') return false;
    if (ord.recipeKeys.length !== inputBuffer.length) return false;
    return ord.recipeKeys.every((key, idx) => key === inputBuffer[idx]);
  });

  if (matchedVip) {
    Sound.vipServe();
    triggerScreenShake();
    combo += 3;
    const vipBonus = GLOBAL_CONFIG.SCORE.VIP_BASE + (combo * 20);
    score += vipBonus;

    let healMsg = '';
    if (lives < activeDiff.INITIAL_LIVES) {
      lives = Math.min(activeDiff.INITIAL_LIVES, lives + 1);
      healMsg = ' & ❤️ HP 회복!';
    }

    showFloatingText(`🎉 진상 퇴치! +${vipBonus}P${healMsg}`, matchedVip.x, matchedVip.y, '#a55eea');

    matchedVip.el.remove();
    orders = orders.filter(o => o.id !== matchedVip.id);

    checkOverclockMilestone();
    renderRecipeBook();
    inputBuffer = [];
    renderInputBuffer();
    updateHUD();
    return;
  }

  // 2. ⚡ EMP 폭탄 판정
  const matchedBomb = orders.find(ord => {
    if (ord.type !== 'bomb') return false;
    if (ord.recipeKeys.length !== inputBuffer.length) return false;
    return ord.recipeKeys.every((key, idx) => key === inputBuffer[idx]);
  });

  if (matchedBomb) {
    Sound.bombExplosion();
    triggerScreenShake();

    flashOverlay.classList.remove('flash-active');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('flash-active');

    const clearCount = orders.length;
    const bombBonus = GLOBAL_CONFIG.SCORE.BOMB_BASE + (clearCount * GLOBAL_CONFIG.SCORE.BOMB_PER_ENEMY);
    score += bombBonus;
    combo += clearCount;

    showFloatingText(`⚡ EMP ALL CLEAR! +${bombBonus}P`, playfield.clientWidth / 2, playfield.clientHeight / 2, '#ffd32a');

    orders.forEach(o => o.el.remove());
    orders = [];

    checkOverclockMilestone();
    renderRecipeBook();
    inputBuffer = [];
    renderInputBuffer();
    updateHUD();
    return;
  }

  // 3. 일반/세트/해동/불지옥 판정
  const matchedRecipe = ALL_RECIPES.find(recipe => {
    if (recipe.keys.length !== inputBuffer.length) return false;
    return recipe.keys.every((key, idx) => key === inputBuffer[idx]);
  });

  if (!matchedRecipe || score < matchedRecipe.unlockScore || matchedRecipe.tier > activeDiff.MAX_RECIPE_TIER) {
    Sound.miss();
    combo = 0;
    showFloatingText("MISMATCH!", playfield.clientWidth / 2, playfield.clientHeight - 80, '#8395a7');
  } else {
    const targetCandidates = orders.filter(ord => {
      if (ord.type === 'frozen' || ord.type === 'vip' || ord.type === 'bomb') return false;
      if (ord.type === 'double') {
        return ord.subOrders[0].id === matchedRecipe.id;
      }
      return ord.recipeId === matchedRecipe.id;
    }).sort((a, b) => b.y - a.y);

    if (targetCandidates.length > 0) {
      const target = targetCandidates[0];

      if (target.type === 'double') {
        target.subOrders.shift();

        if (target.subOrders.length > 0) {
          Sound.stepSuccess();
          combo++;
          score += 100;
          showFloatingText(`단 서빙 완료! 다음 요리!`, target.x, target.y - 15, '#10ac84');
          updateDoubleBubble(target);
        } else {
          Sound.serveSuccess();
          combo += target.totalSetSize;
          const bonus = (GLOBAL_CONFIG.SCORE.DOUBLE_FINISH * (target.totalSetSize === 3 ? 1.5 : 1)) + (combo * 15);
          score += Math.floor(bonus);
          showFloatingText(`🍱 ${target.totalSetSize}단 완벽 서빙! +${Math.floor(bonus)}P`, target.x, target.y, '#05c46b');
          target.el.remove();
          orders = orders.filter(o => o.id !== target.id);
        }

      } else if (target.type === 'thawed') {
        Sound.serveSuccess();
        combo++;
        const addedScore = GLOBAL_CONFIG.SCORE.FROZEN_FINISH + (combo * 14);
        score += addedScore;
        showFloatingText(`❄️ 해동 조리 완벽 서빙! +${addedScore}P`, target.x, target.y, '#0984e3');

        target.el.remove();
        orders = orders.filter(o => o.id !== target.id);

      } else {
        Sound.serveSuccess();
        combo++;

        const isHell = (target.type === 'hellfire');
        const tierBonus = matchedRecipe.keys.length * 35;
        const hellBonus = isHell ? GLOBAL_CONFIG.SCORE.HELLFIRE_BONUS : 0;
        const addedScore = 60 + tierBonus + hellBonus + (combo * 12);
        score += addedScore;

        if (isHell) {
          showFloatingText(`🔥 불지옥 격파! +${addedScore}`, target.x, target.y, '#ff3838');
        } else {
          showFloatingText(`+${addedScore} SERVED!`, target.x, target.y, '#2ed573');
        }

        target.el.remove();
        orders = orders.filter(o => o.id !== target.id);
      }

      checkOverclockMilestone();
      renderRecipeBook();
    } else {
      Sound.miss();
      combo = 0;
      showFloatingText("NO ORDER!", playfield.clientWidth / 2, playfield.clientHeight - 80, '#ffa502');
    }
  }

  inputBuffer = [];
  renderInputBuffer();
  updateHUD();
}

function checkOverclockMilestone() {
  const currentMilestone = Math.floor(score / GLOBAL_CONFIG.ENDLESS.STEP_SCORE);
  if (currentMilestone > lastOverclockMilestone) {
    lastOverclockMilestone = currentMilestone;
    Sound.bombAlert();
    triggerScreenShake();
    showFloatingText(`⚡ ${currentMilestone * GLOBAL_CONFIG.ENDLESS.STEP_SCORE}P 돌파! 속도 영구 가속!`, playfield.clientWidth / 2, playfield.clientHeight / 2 - 40, '#ff3838');
  }
}

/* ==========================================================================
   🏁 게임 라이프사이클 (TRY AGAIN ➜ 선택된 난이도 유지하며 메인 복귀!)
   ========================================================================== */
function startGame() {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  activeDiff = DIFFICULTIES[selectedDifficulty];
  score = 0;
  combo = 0;
  lives = activeDiff.INITIAL_LIVES;
  orders.forEach(o => o.el.remove());
  orders = [];
  inputBuffer = [];
  lastBombSpawnTime = Date.now();
  lastVipSpawnTime = Date.now();
  lastSpawnedTier = 0;
  lastOverclockMilestone = 0;

  diffBadgeEl.textContent = activeDiff.badge;
  diffBadgeEl.style.color = activeDiff.badgeColor;

  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';

  isPlaying = true;
  lastFrameTime = performance.now();

  renderRecipeBook();
  renderInputBuffer();
  updateHUD();

  clearTimeout(spawnTimer);
  spawnOrder();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isPlaying = false;
  clearTimeout(spawnTimer);
  finalScoreEl.textContent = score;
  gameOverDiffEl.textContent = activeDiff.badge;
  gameOverDiffEl.style.color = activeDiff.badgeColor;
  gameOverScreen.style.display = 'flex';
}

startBtn.addEventListener('click', startGame);

// 💡 [TRY AGAIN 클릭 시] 난이도 세팅 유지한 채 메인 화면으로 복귀!
restartBtn.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  startScreen.style.display = 'flex';

  // 현재 선택된 난이도 상태 유지 및 설명 갱신
  activeDiff = DIFFICULTIES[selectedDifficulty];
  diffDescEl.textContent = activeDiff.desc;
  diffBadgeEl.textContent = activeDiff.badge;
  diffBadgeEl.style.color = activeDiff.badgeColor;
  renderRecipeBook();
});

renderRecipeBook();