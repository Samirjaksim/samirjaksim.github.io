/* ==========================================================================
   🎮 [주방장 전용 황금 밸런스 제어판 - 여행자 커스텀 세팅 반영완료]
   ========================================================================== */
const CONFIG = {
    // 1. 기본 세팅
    INITIAL_LIVES: 5,            // 주방 체력 (❤️ 5개)

    // 2. 낙하 속도 밸런스
    BASE_SPEED: 44,              // 기본 속도
    MAX_SPEED_BONUS: 55,         // 점수 비례 최대 가속
    HELLFIRE_SPEED_MULT: 1.8,    // 🔥 불지옥 급발진 배율
    DOUBLE_SPEED_MULT: 0.6,      // 🍱 2단 세트 느림보 배율
    FROZEN_SPEED_MULT: 0.8,      // ❄️ 냉동 음식 배율 (해동+조리 시간 확보)
    BOMB_SPEED: 33,              // ⚡ EMP 폭탄 속도 (6단 칠 시간 확보)
    VIP_SPEED: 28,               // 👿 진상 손님 거북이 속도

    // 3. 특수 기믹 출현 확률 (0.01 = 1%)
    CHANCE: {
        HELLFIRE: 0.08,            // 🔥 불지옥 (8%)
        FROZEN: 0.08,              // ❄️ 냉동 음식 (8%)
        DOUBLE: 0.08,              // 🍱 2단 세트 (8%)
        BOMB: 0.08,                // ⚡ EMP 폭탄 (8%)
        VIP: 0.075                 // 👿 진상 손님 (7.5%)
    },

    // 4. 특수 기믹 쿨타임 (밀리초)
    COOLDOWN: {
        BOMB_MS: 30000,            // ⚡ EMP 폭탄 쿨타임 (30초)
        VIP_MS: 40000              // 👿 진상 손님 쿨타임 (40초)
    },

    // 5. 🗺️ 티어별 순차 해금 점수표
    UNLOCK_REQ: {
        HELLFIRE_SCORE: 80,        // ⭐ 1티어: 불지옥 해금
        FROZEN_SCORE: 550,         // ⭐⭐ 2티어: 냉동 음식 해금
        DOUBLE_SCORE: 2300,        // ⭐⭐⭐ 3티어: 2단 세트 해금
        BOMB_SCORE: 550,           // ⭐⭐ 2티어: ⚡ EMP 폭탄 조기 해금!
        VIP_SCORE: 5700            // 👑 4티어: 👿 8단 진상 손님 해금 (최종 보스)
    },

    // 6. 보너스 점수표
    SCORE: {
        BOMB_BASE: 350,            // 올킬 폭탄 기본 점수
        BOMB_PER_ENEMY: 90,        // 폭탄으로 쓸어담은 음식 1개당 추가 점수
        VIP_BASE: 1200,            // 진상 퇴치 기본 점수 (+체력 1칸 회복)
        DOUBLE_FINISH: 350,        // 2단 세트 완벽 서빙 보너스
        FROZEN_FINISH: 260,        // 해동 ➜ 조리 완벽 서빙 보너스
        HELLFIRE_BONUS: 80         // 불지옥 서빙 보너스
    },

    // 7. 커맨드 타수
    BOMB_KEY_COUNT: 6,           // ⚡ EMP 폭탄 화살표 수 (랜덤 6개 + Space)
    VIP_KEY_COUNT: 8,            // 👿 진상 손님 화살표 수 (랜덤 8개 + Space)
    FROZEN_HITS: 3,              // ❄️ 냉동 해동 연타 횟수 (3회)

    // 8. 🏆 고인물 변별용 무한 가속 장치 (엔드게임 시스템)
    ENDLESS: {
        STEP_SCORE: 10000,         // 10,000점 단위마다 발동
        SPEED_BOOST_PER_STEP: 6    // 10,000점마다 영구 추가되는 속도치 (+6씩 누적)
    }
};

/* ==========================================================================
   📖 16종 요리 레시피 (여행자 커스텀 커맨드 완벽 반영)
   ========================================================================== */
const ALL_RECIPES = [
    // [Tier 1] 1키 + Space (0P ~ 549P)
    { id: 'pizza', name: '피자', emoji: '🍕', tier: 1, keys: ['ArrowLeft', 'Space'], labels: ['◀', 'Space'], unlockScore: 0 },
    { id: 'chicken', name: '치킨', emoji: '🍗', tier: 1, keys: ['ArrowRight', 'Space'], labels: ['▶', 'Space'], unlockScore: 0 },
    { id: 'burger', name: '버거', emoji: '🍔', tier: 1, keys: ['ArrowUp', 'Space'], labels: ['▲', 'Space'], unlockScore: 120 },
    { id: 'fries', name: '감자튀김', emoji: '🍟', tier: 1, keys: ['ArrowDown', 'Space'], labels: ['▼', 'Space'], unlockScore: 280 },

    // [Tier 2] 2키 + Space (550P ~ 2299P)
    { id: 'hotdog', name: '핫도그', emoji: '🌭', tier: 2, keys: ['ArrowLeft', 'ArrowRight', 'Space'], labels: ['◀', '▶', 'Space'], unlockScore: 550 },
    { id: 'taco', name: '타코', emoji: '🌮', tier: 2, keys: ['ArrowUp', 'ArrowDown', 'Space'], labels: ['▲', '▼', 'Space'], unlockScore: 900 },
    { id: 'ramen', name: '라면', emoji: '🍜', tier: 2, keys: ['ArrowDown', 'ArrowRight', 'Space'], labels: ['▼', '▶', 'Space'], unlockScore: 1300 },
    { id: 'dumpling', name: '만두', emoji: '🥟', tier: 2, keys: ['ArrowLeft', 'ArrowUp', 'Space'], labels: ['◀', '▲', 'Space'], unlockScore: 1750 },

    // [Tier 3] 3키 + Space (2300P ~ 5699P)
    { id: 'sushi', name: '초밥', emoji: '🍣', tier: 3, keys: ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'Space'], labels: ['◀', '▲', '▶', 'Space'], unlockScore: 2300 },
    { id: 'cake', name: '케이크', emoji: '🍰', tier: 3, keys: ['ArrowUp', 'ArrowDown', 'ArrowUp', 'Space'], labels: ['▲', '▼', '▲', 'Space'], unlockScore: 3000 },
    { id: 'steak', name: '스테이크', emoji: '🥩', tier: 3, keys: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'Space'], labels: ['▶', '▼', '◀', 'Space'], unlockScore: 3800 },
    { id: 'pasta', name: '파스타', emoji: '🍝', tier: 3, keys: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'Space'], labels: ['◀', '▶', '◀', 'Space'], unlockScore: 4700 },

    // [Tier 4] 4키 + Space (5700P ~)
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
   🔊 Web Audio 사운드 시스템
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
   🎮 게임 상태 및 DOM 변수
   ========================================================================== */
let isPlaying = false;
let score = 0;
let combo = 0;
let lives = CONFIG.INITIAL_LIVES;
let orders = [];
let inputBuffer = [];
let spawnTimer = null;
let lastBombSpawnTime = 0;
let lastVipSpawnTime = 0;
let lastFrameTime = performance.now();

// 💡 4티어 연속 방지 및 10,000P 가속 추적 변수
let lastSpawnedTier = 0;         // 직전에 스폰된 요리 티어 추적 (4티어 연속 방지)
let lastOverclockMilestone = 0;  // 1만점 단위 마일스톤 추적

const playfield = document.getElementById('playfield');
const flashOverlay = document.getElementById('flash-overlay');
const recipesListEl = document.getElementById('recipes-list');
const inputBufferEl = document.getElementById('input-buffer');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const heartsEl = document.getElementById('hearts');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');

/* ==========================================================================
   🖥️ UI 렌더링
   ========================================================================== */
function renderRecipeBook() {
    recipesListEl.innerHTML = '';
    const tiers = [
        { tier: 1, title: 'TIER 1 (1 KEY)' },
        { tier: 2, title: 'TIER 2 (2 KEYS)' },
        { tier: 3, title: 'TIER 3 (3 KEYS)' },
        { tier: 4, title: 'TIER 4 (4 KEYS)' }
    ];

    tiers.forEach(t => {
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
        inputBufferEl.innerHTML = `<span style="color: #64748b; font-size: 13px;">커맨드 입력 후 [SPACE] 서빙 (냉동은 SPACE 3연타!)</span>`;
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
  const safeLives = Math.max(0, Math.min(CONFIG.INITIAL_LIVES, lives));
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
    setTimeout(() => el.remove(), 900);
}

function triggerScreenShake() {
    playfield.classList.add('screen-shake');
    setTimeout(() => playfield.classList.remove('screen-shake'), 250);
}

/* ==========================================================================
   📦 주문 스폰 & 4티어 연속 방지 스마트 셀렉터
   ========================================================================== */
function getAvailableRecipes() {
    return ALL_RECIPES.filter(r => score >= r.unlockScore);
}

// 🛡️ [핵심 안전장치] 직전에 4티어가 나왔다면 이번에는 1~3티어 중에서만 뽑도록 필터링!
function pickSmartRecipe() {
    let available = getAvailableRecipes();

    if (lastSpawnedTier === 4) {
        const nonTier4 = available.filter(r => r.tier < 4);
        if (nonTier4.length > 0) {
            available = nonTier4;
        }
    }

    const picked = available[Math.floor(Math.random() * available.length)];
    lastSpawnedTier = picked.tier; // 방금 뽑은 티어 기록
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

    order.el.innerHTML = `
    <div class="order-bubble">
      <div class="order-header">
        <span class="emoji">${currentRecipe.emoji}</span>
        <span>${currentRecipe.name}</span>
        <span class="double-badge">🍱 세트 (${2 - order.subOrders.length + 1}/2)</span>
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
    for (let i = 0; i < CONFIG.FROZEN_HITS; i++) {
        const isBroken = i >= order.hitsRemaining;
        keysHtml += `<span class="mini-key space ice-key ${isBroken ? 'broken' : ''}">${isBroken ? '깨짐' : 'SPACE'}</span>`;
    }

    order.el.innerHTML = `
    <div class="order-bubble">
      <div class="order-header">
        <span class="emoji">${recipe.emoji}</span>
        <span style="color:#1e90ff;">냉동 ${recipe.name}</span>
        <span class="frozen-badge">❄️얼음(${order.hitsRemaining}/${CONFIG.FROZEN_HITS})</span>
      </div>
      <div class="order-command">
        ${keysHtml}
      </div>
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
    const x = Math.floor(Math.random() * (fieldWidth - 250)) + 125;

    // 🏆 10,000점마다 영구 가속되는 고인물 스피드 계산!
    const endlessBoost = Math.floor(score / CONFIG.ENDLESS.STEP_SCORE) * CONFIG.ENDLESS.SPEED_BOOST_PER_STEP;
    const baseSpeed = CONFIG.BASE_SPEED + Math.min(score * 0.012, CONFIG.MAX_SPEED_BONUS) + endlessBoost;

    // 1. 👑 [4티어] 👿 8단 진상 손님 (5700P 이상)
    const hasVip = orders.some(o => o.type === 'vip');
    const canSpawnVip = (score >= CONFIG.UNLOCK_REQ.VIP_SCORE) && (!hasVip) && (Date.now() - lastVipSpawnTime > CONFIG.COOLDOWN.VIP_MS);
    const isVip = canSpawnVip && (Math.random() < CONFIG.CHANCE.VIP);

    if (isVip) {
        lastVipSpawnTime = Date.now();
        lastSpawnedTier = 0;
        Sound.vipAlert();
        const vipData = generateRandomRecipe(CONFIG.VIP_KEY_COUNT);

        const el = document.createElement('div');
        el.className = 'order-entity vip';
        el.innerHTML = `
      <div class="order-bubble">
        <div class="order-header">
          <span class="emoji">👿</span>
          <span>진상 손님</span>
          <span class="vip-badge">${CONFIG.VIP_KEY_COUNT}단 콤보</span>
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
            speed: CONFIG.VIP_SPEED,
            el: el
        });

        showFloatingText(`⚠️ 진상 손님 출현!! (${CONFIG.VIP_KEY_COUNT}단)`, fieldWidth / 2, 80, '#a55eea');

    } else {
        // 2. ⭐⭐ [2티어 조기해금] ⚡ EMP 올킬 폭탄 (550P 이상, 30초 쿨타임)
        const hasBomb = orders.some(o => o.type === 'bomb');
        const canSpawnBomb = (score >= CONFIG.UNLOCK_REQ.BOMB_SCORE) && (!hasBomb) && (Date.now() - lastBombSpawnTime > CONFIG.COOLDOWN.BOMB_MS);
        const isBomb = canSpawnBomb && (Math.random() < CONFIG.CHANCE.BOMB);

        if (isBomb) {
            lastBombSpawnTime = Date.now();
            lastSpawnedTier = 0;
            Sound.bombAlert();
            const bombData = generateRandomRecipe(CONFIG.BOMB_KEY_COUNT);

            const el = document.createElement('div');
            el.className = 'order-entity bomb';
            el.innerHTML = `
        <div class="order-bubble">
          <div class="order-header">
            <span class="emoji">💣</span>
            <span>EMP 폭탄</span>
            <span class="bomb-badge">⚡올킬 ${CONFIG.BOMB_KEY_COUNT}단</span>
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
                speed: CONFIG.BOMB_SPEED,
                el: el
            });

            showFloatingText(`⚡ EMP 폭탄 출현!! (${CONFIG.BOMB_KEY_COUNT}단 올킬)`, fieldWidth / 2, 80, '#ffd32a');

        } else {
            const roll = Math.random();

            // 3. ⭐⭐⭐ [3티어] 🍱 2단 세트 손님 (2300P 이상)
            if (roll < CONFIG.CHANCE.DOUBLE && score >= CONFIG.UNLOCK_REQ.DOUBLE_SCORE) {
                const r1 = pickSmartRecipe();
                const r2 = pickSmartRecipe();

                const el = document.createElement('div');
                el.className = 'order-entity double';
                playfield.appendChild(el);

                const doubleOrder = {
                    id: Date.now() + Math.random(),
                    type: 'double',
                    subOrders: [r1, r2],
                    x: x,
                    y: -50,
                    speed: baseSpeed * CONFIG.DOUBLE_SPEED_MULT,
                    el: el
                };

                updateDoubleBubble(doubleOrder);
                orders.push(doubleOrder);

            } else if (roll < CONFIG.CHANCE.DOUBLE + CONFIG.CHANCE.FROZEN && score >= CONFIG.UNLOCK_REQ.FROZEN_SCORE) {
                // 4. ⭐⭐ [2티어] ❄️ 냉동 음식 (550P 이상, SPACE 3타 ➜ 조리)
                const recipe = pickSmartRecipe();
                const el = document.createElement('div');
                el.className = 'order-entity frozen';
                playfield.appendChild(el);

                const frozenOrder = {
                    id: Date.now() + Math.random(),
                    type: 'frozen',
                    recipeId: recipe.id,
                    recipeObj: recipe,
                    hitsRemaining: CONFIG.FROZEN_HITS,
                    x: x,
                    y: -45,
                    speed: baseSpeed * CONFIG.FROZEN_SPEED_MULT,
                    el: el
                };

                updateFrozenBubble(frozenOrder);
                orders.push(frozenOrder);

            } else if (roll < CONFIG.CHANCE.DOUBLE + CONFIG.CHANCE.FROZEN + CONFIG.CHANCE.HELLFIRE && score >= CONFIG.UNLOCK_REQ.HELLFIRE_SCORE) {
                // 5. ⭐ [1티어] 🔥 불지옥 급발진 음식 (80P 이상)
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
                    speed: baseSpeed * CONFIG.HELLFIRE_SPEED_MULT,
                    el: el
                });

            } else {
                // 6. 일반 순수 음식
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

    const nextInterval = Math.max(900, 1900 - (score * 0.25));
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

    const dangerThreshold = playfield.clientHeight - 85;

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
   ⌨️ 키 입력 & 판정
   ========================================================================== */
window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
    }

    if (!isPlaying) return;

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        if (inputBuffer.length < 9) {
            inputBuffer.push(e.code);
            Sound.keyPress();
            renderInputBuffer();
        }
    } else if (e.code === 'Space') {
        handleSpaceAction();
    } else if (e.code === 'Backspace') {
        inputBuffer.pop();
        renderInputBuffer();
    }
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
                showFloatingText(`🧊 해동 완료! 이제 조리하세요!`, target.x, target.y - 15, '#0984e3');
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
    // 1. 👿 진상 손님 판정 (8단)
    const matchedVip = orders.find(ord => {
        if (ord.type !== 'vip') return false;
        if (ord.recipeKeys.length !== inputBuffer.length) return false;
        return ord.recipeKeys.every((key, idx) => key === inputBuffer[idx]);
    });

    if (matchedVip) {
        Sound.vipServe();
        triggerScreenShake();
        combo += 3;
        const vipBonus = CONFIG.SCORE.VIP_BASE + (combo * 20);
        score += vipBonus;

        // 🛡️ [오버힐 완벽 차단] 최대 체력 한도(5칸)를 절대 넘지 못하도록 잠금!
        let healMsg = '';
        if (lives < CONFIG.INITIAL_LIVES) {
            lives = Math.min(CONFIG.INITIAL_LIVES, lives + 1);
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

    // 2. ⚡ EMP 올킬 폭탄 판정 (6단)
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
        const bombBonus = CONFIG.SCORE.BOMB_BASE + (clearCount * CONFIG.SCORE.BOMB_PER_ENEMY);
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

    // 3. 일반/세트/해동/불지옥 레시피 매칭
    const matchedRecipe = ALL_RECIPES.find(recipe => {
        if (recipe.keys.length !== inputBuffer.length) return false;
        return recipe.keys.every((key, idx) => key === inputBuffer[idx]);
    });

    if (!matchedRecipe || score < matchedRecipe.unlockScore) {
        Sound.miss();
        combo = 0;
        showFloatingText("MISMATCH!", playfield.clientWidth / 2, playfield.clientHeight - 130, '#8395a7');
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
                    showFloatingText("1단 서빙 완료! 다음 요리!", target.x, target.y - 15, '#10ac84');
                    updateDoubleBubble(target);
                } else {
                    Sound.serveSuccess();
                    combo += 2;
                    const bonus = CONFIG.SCORE.DOUBLE_FINISH + (combo * 15);
                    score += bonus;
                    showFloatingText(`🍱 세트 완벽 서빙! +${bonus}P`, target.x, target.y, '#05c46b');
                    target.el.remove();
                    orders = orders.filter(o => o.id !== target.id);
                }

            } else if (target.type === 'thawed') {
                Sound.serveSuccess();
                combo++;
                const addedScore = CONFIG.SCORE.FROZEN_FINISH + (combo * 14);
                score += addedScore;
                showFloatingText(`❄️ 해동 조리 완벽 서빙! +${addedScore}P`, target.x, target.y, '#0984e3');

                target.el.remove();
                orders = orders.filter(o => o.id !== target.id);

            } else {
                Sound.serveSuccess();
                combo++;

                const isHell = (target.type === 'hellfire');
                const tierBonus = matchedRecipe.keys.length * 35;
                const hellBonus = isHell ? CONFIG.SCORE.HELLFIRE_BONUS : 0;
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
            showFloatingText("NO ORDER!", playfield.clientWidth / 2, playfield.clientHeight - 130, '#ffa502');
        }
    }

    inputBuffer = [];
    renderInputBuffer();
    updateHUD();
}

// ⚡ 10,000점 단위 고인물 가속 마일스톤 검사
function checkOverclockMilestone() {
    const currentMilestone = Math.floor(score / CONFIG.ENDLESS.STEP_SCORE);
    if (currentMilestone > lastOverclockMilestone) {
        lastOverclockMilestone = currentMilestone;
        Sound.bombAlert();
        triggerScreenShake();
        showFloatingText(`⚡ ${currentMilestone * CONFIG.ENDLESS.STEP_SCORE}P 돌파! 속도 영구 가속 발동!`, playfield.clientWidth / 2, playfield.clientHeight / 2 - 40, '#ff3838');
    }
}

/* ==========================================================================
   🏁 게임 라이프사이클
   ========================================================================== */
function startGame() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    score = 0;
    combo = 0;
    lives = CONFIG.INITIAL_LIVES;
    orders.forEach(o => o.el.remove());
    orders = [];
    inputBuffer = [];
    lastBombSpawnTime = Date.now();
    lastVipSpawnTime = Date.now();
    lastSpawnedTier = 0;
    lastOverclockMilestone = 0;

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
    gameOverScreen.style.display = 'flex';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

renderRecipeBook();