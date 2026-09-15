const MAX_DEX = 1025;
const GACHA_COST = 100;
const SHINY_CHANCE = 0.01;
const POKE_SIZE = 90;
const INSPECT_REWARD = 50;

const FIELD_UPGRADES = [
  { target: 10, cost: 100 },
  { target: 15, cost: 300 },
  { target: 20, cost: 700 },
  { target: 25, cost: 1500 },
  { target: 30, cost: 3000 }
];

const GENERATIONS = [
  { name: "1세대 (관동)", start: 1, end: 151 },
  { name: "2세대 (성도)", start: 152, end: 251 },
  { name: "3세대 (호연)", start: 252, end: 386 },
  { name: "4세대 (신오)", start: 387, end: 493 },
  { name: "5세대 (하나)", start: 494, end: 649 },
  { name: "6세대 (칼로스)", start: 650, end: 721 },
  { name: "7세대 (알로라)", start: 722, end: 809 },
  { name: "8세대 (가라르)", start: 810, end: 905 },
  { name: "9세대 (팔데아)", start: 906, end: 1025 }
];

let coins = parseInt(localStorage.getItem('poke_coins') || '0', 10);
let maxField = parseInt(localStorage.getItem('poke_max_field') || '5', 10);

const discoveredList = JSON.parse(localStorage.getItem('poke_discovered') || '[]');
const discovered = new Set(discoveredList);

const shinyList = JSON.parse(localStorage.getItem('poke_shiny_discovered') || '[]');
const shinyDiscovered = new Set(shinyList);

const inspectedList = JSON.parse(localStorage.getItem('poke_inspected') || '[]');
const inspected = new Set(inspectedList);

let isSoundMuted = localStorage.getItem('poke_sound_muted') === 'true';
let isResetting = false;

const pokemons = [];
const pokeCache = {};

const fieldEl = document.getElementById('field');
const coinEl = document.getElementById('coin-display');
const fieldCountEl = document.getElementById('field-count');
const maxCountEl = document.getElementById('max-count');
const expandBtnEl = document.getElementById('expand-btn');

const dexCountEl = document.getElementById('dex-count');
const modalDexCountEl = document.getElementById('modal-dex-count');
const modalInspectCountEl = document.getElementById('modal-inspect-count');

const tooltipEl = document.getElementById('info-tooltip');
const tooltipDexEl = document.getElementById('tooltip-dex');
const tooltipNameEl = document.getElementById('tooltip-name');
const tooltipTypesEl = document.getElementById('tooltip-types');
const tooltipAdoptNoteEl = document.getElementById('tooltip-adopt-note');

const discoveryBannerEl = document.getElementById('discovery-banner');
const bannerImgEl = document.getElementById('banner-img');
const bannerDexEl = document.getElementById('banner-dex');
const bannerNameEl = document.getElementById('banner-name');
let bannerTimer = null;

const pokedexModalEl = document.getElementById('pokedex-modal');
const genTabsEl = document.getElementById('gen-tabs');
const pokedexGridEl = document.getElementById('pokedex-grid');

const detailModalEl = document.getElementById('detail-modal');
const detailDexEl = document.getElementById('detail-dex');
const detailNameEl = document.getElementById('detail-name');
const detailGenusEl = document.getElementById('detail-genus');
const detailImgEl = document.getElementById('detail-img');
const detailTypesEl = document.getElementById('detail-types');
const detailHeightEl = document.getElementById('detail-height');
const detailWeightEl = document.getElementById('detail-weight');
const detailFlavorEl = document.getElementById('detail-flavor');

const rulebookModalEl = document.getElementById('rulebook-modal');
const settingsModalEl = document.getElementById('settings-modal');
const soundBtnEl = document.getElementById('sound-btn');

let currentGenIndex = 0;
let currentDetailId = null;
let draggedPoke = null;
let dragOffset = { x: 0, y: 0 };
let pressTimer = null;

// 도감 그리드 드래그 변수
let isGridDown = false;
let startGridY = 0;
let startScrollTop = 0;
let hasDraggedGrid = false;

// 탭 가로 드래그 변수
let isTabDown = false;
let startTabX = 0;
let startScrollLeft = 0;
let hasDraggedTabs = false;

const TYPE_CONFIG = {
  normal: { name: '노말', color: '#A8A878' }, fire: { name: '불꽃', color: '#F08030' },
  water: { name: '물', color: '#6890F0' }, grass: { name: '풀', color: '#78C850' },
  electric: { name: '전기', color: '#F8D030' }, ice: { name: '얼음', color: '#98D8D8' },
  fighting: { name: '격투', color: '#C03028' }, poison: { name: '독', color: '#A040A0' },
  ground: { name: '땅', color: '#E0C068' }, flying: { name: '비행', color: '#A890F0' },
  psychic: { name: '에스퍼', color: '#F85888' }, bug: { name: '벌레', color: '#A8B820' },
  rock: { name: '바위', color: '#B8A038' }, ghost: { name: '고스트', color: '#705598' },
  dragon: { name: '드래곤', color: '#7038F8' }, steel: { name: '강철', color: '#B8B8D0' },
  fairy: { name: '페어리', color: '#EE99AC' }, dark: { name: '악', color: '#705848' }
};

function getSpriteUrl(id, isShiny = false) {
  const path = isShiny ? 'shiny/' : '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${path}${id}.png`;
}

function getOfficialArtworkUrl(id, isShiny = false) {
  const path = isShiny ? 'shiny/' : '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${path}${id}.png`;
}

function playPokemonCry(id) {
  if (isSoundMuted) return;
  try {
    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  } catch (e) {}
}

async function getPokemonData(id) {
  if (pokeCache[id]) return pokeCache[id];
  try {
    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokeData = await pokeRes.json();
    const rawTypes = pokeData.types.map(t => t.type.name);
    const height = (pokeData.height / 10).toFixed(1);
    const weight = (pokeData.weight / 10).toFixed(1);

    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const speciesData = await speciesRes.json();
    
    const koEntry = speciesData.names.find(n => n.language.name === 'ko');
    const koName = koEntry ? koEntry.name : `포켓몬 #${id}`;

    const genusEntry = speciesData.genera.find(g => g.language.name === 'ko');
    const genus = genusEntry ? genusEntry.genus : '알 수 없음';

    const flavorEntry = speciesData.flavor_text_entries.find(f => f.language.name === 'ko');
    let flavor = flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f\r]/g, ' ') : '오박사님이 열심히 생태를 연구 중인 포켓몬이다.';

    pokeCache[id] = {
      name: koName,
      types: rawTypes,
      height: height,
      weight: weight,
      genus: genus,
      flavor: flavor
    };
    return pokeCache[id];
  } catch (err) {
    return {
      name: `포켓몬 #${id}`,
      types: [],
      height: '?',
      weight: '?',
      genus: '미지의 포켓몬',
      flavor: '데이터를 불러오는 중입니다.'
    };
  }
}

function registerDiscovery(id, isShiny = false) {
  const isFirstTime = !discovered.has(id);
  if (isFirstTime) {
    discovered.add(id);
    localStorage.setItem('poke_discovered', JSON.stringify(Array.from(discovered)));
    updateHUD();
    triggerDiscoveryCelebration(id, isShiny);
  }
  if (isShiny && !shinyDiscovered.has(id)) {
    shinyDiscovered.add(id);
    localStorage.setItem('poke_shiny_discovered', JSON.stringify(Array.from(shinyDiscovered)));
  }
}

async function triggerDiscoveryCelebration(id, isShiny) {
  playPokemonCry(id);
  bannerImgEl.src = getSpriteUrl(id, isShiny);
  bannerDexEl.innerText = `#${id}`;
  bannerNameEl.innerText = '도감 확인 중...';

  discoveryBannerEl.classList.remove('hidden');
  discoveryBannerEl.style.animation = 'none';
  discoveryBannerEl.offsetHeight;
  discoveryBannerEl.style.animation = null;

  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    discoveryBannerEl.classList.add('hidden');
  }, 2600);

  const data = await getPokemonData(id);
  bannerNameEl.innerText = data.name + (isShiny ? ' (이로치!)' : '');
}

function addCoins(amount) {
  coins += amount;
  localStorage.setItem('poke_coins', coins);
  updateHUD();
}

function saveFieldState() {
  if (isResetting) return;

  const fieldState = pokemons.map(p => ({
    id: p.id,
    x: Math.round(p.x),
    y: Math.round(p.y),
    isShiny: p.isShiny,
    isAdopted: p.isAdopted
  }));
  localStorage.setItem('poke_field_pokemons', JSON.stringify(fieldState));
}

function loadFieldState() {
  const saved = localStorage.getItem('poke_field_pokemons');
  if (!saved) return;
  try {
    const list = JSON.parse(saved);
    list.forEach(item => {
      spawnPokemon(item.id, item.x, item.y, item.isShiny, item.isAdopted, false, true);
    });
  } catch (e) {
    console.error('필드 불러오기 에러:', e);
  }
}

function spawnRandomBasic() {
  const randomId = Math.floor(Math.random() * 5) + 1;
  spawnPokemon(randomId, null, null, null, false);
}

function spawnPokemon(id, posX = null, posY = null, forceShiny = null, isAdopted = false, shouldSave = true, isSilent = false) {
  if (pokemons.length >= maxField) {
    if (!isSilent) {
      showFloatingMsg(`🐾 목장이 꽉 찼어! (최대 ${maxField}마리)`, 300, 200);
    }
    return false;
  }
  if (id > MAX_DEX) return false;

  const isShiny = forceShiny !== null ? forceShiny : (Math.random() < SHINY_CHANCE);

  registerDiscovery(id, isShiny);
  getPokemonData(id);

  const fieldRect = fieldEl.getBoundingClientRect();
  const x = posX !== null ? posX : Math.random() * (fieldRect.width - 100) + 10;
  const y = posY !== null ? posY : Math.random() * (fieldRect.height - 100) + 10;

  const el = document.createElement('div');
  el.className = `pokemon ${isShiny ? 'shiny' : ''}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  const img = document.createElement('img');
  img.src = getSpriteUrl(id, isShiny);
  img.draggable = false;

  const badge = document.createElement('span');
  badge.className = `dex-badge ${isAdopted ? 'adopted' : ''}`;
  
  let badgeText = `#${id}`;
  if (isAdopted) badgeText = `🏷️ ${badgeText}`;
  if (isShiny) badgeText = `✨ ${badgeText}`;
  badge.innerText = badgeText;

  el.appendChild(img);
  el.appendChild(badge);
  fieldEl.appendChild(el);

  const pokeData = {
    id: id,
    isShiny: isShiny,
    isAdopted: isAdopted,
    el: el,
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7,
    changeTimer: 0,
    isDragging: false
  };

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    draggedPoke = pokeData;
    pokeData.isDragging = true;
    const rect = el.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    pressTimer = setTimeout(() => {
      if (draggedPoke === pokeData) {
        showTooltip(pokeData, e.clientX, e.clientY);
      }
    }, 220);
  });

  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    clearTimeout(pressTimer);
    hideTooltip();
    releasePokemon(pokeData);
  });

  pokemons.push(pokeData);
  updateHUD();

  if (shouldSave) saveFieldState();
  return true;
}

function pullGacha() {
  if (coins < GACHA_COST) {
    showFloatingMsg(`💰 코인이 부족해! (${GACHA_COST}C 필요)`, 300, 200);
    return;
  }
  if (pokemons.length >= maxField) {
    showFloatingMsg(`🐾 목장이 꽉 찼어! (최대 ${maxField}마리)`, 300, 200);
    return;
  }

  const missingPool = [];
  for (let i = 1; i <= MAX_DEX; i++) {
    if (!discovered.has(i)) missingPool.push(i);
  }

  if (missingPool.length === 0) {
    showFloatingMsg("🎉 1025마리 모두 발견 완료!", 300, 200);
    return;
  }

  addCoins(-GACHA_COST);

  const randomIndex = Math.floor(Math.random() * missingPool.length);
  const selectedId = missingPool[randomIndex];

  const spawned = spawnPokemon(selectedId, null, null, null, true);
  if (spawned) {
    showFloatingMsg(`🎉 🏷️ 입양 성공! #${selectedId} 획득!`, 300, 200);
  }
}

function upgradeFieldCapacity() {
  const nextUpgrade = FIELD_UPGRADES.find(u => u.target > maxField);
  if (!nextUpgrade) return;

  if (coins < nextUpgrade.cost) {
    showFloatingMsg(`💰 코인이 부족해! (${nextUpgrade.cost}C 필요)`, 300, 160);
    return;
  }

  addCoins(-nextUpgrade.cost);
  maxField = nextUpgrade.target;
  localStorage.setItem('poke_max_field', maxField);
  showFloatingMsg(`🏡 목장 확장 완료! (최대 ${maxField}마리)`, 300, 160);
  updateHUD();
}

async function showTooltip(poke, clientX, clientY) {
  let dexPrefix = '';
  if (poke.isShiny) dexPrefix += '✨ ';
  if (poke.isAdopted) dexPrefix += '🏷️ ';
  tooltipDexEl.innerText = `${dexPrefix}#${poke.id}`;

  tooltipNameEl.innerText = '정보 로딩 중...';
  tooltipTypesEl.innerHTML = '';
  tooltipEl.classList.remove('hidden');

  if (poke.isAdopted) {
    tooltipAdoptNoteEl.classList.remove('hidden');
  } else {
    tooltipAdoptNoteEl.classList.add('hidden');
  }

  updateTooltipPos(clientX, clientY);

  const data = await getPokemonData(poke.id);
  tooltipNameEl.innerText = data.name + (poke.isShiny ? ' (이로치)' : '');
  tooltipTypesEl.innerHTML = '';

  data.types.forEach(tKey => {
    const typeInfo = TYPE_CONFIG[tKey] || { name: tKey, color: '#888' };
    const pill = document.createElement('span');
    pill.className = 'type-pill';
    pill.style.backgroundColor = typeInfo.color;
    pill.innerText = typeInfo.name;
    tooltipTypesEl.appendChild(pill);
  });
}

function updateTooltipPos(clientX, clientY) {
  const fieldRect = fieldEl.getBoundingClientRect();
  const tx = clientX - fieldRect.left + 20;
  const ty = clientY - fieldRect.top - 30;
  tooltipEl.style.left = `${tx}px`;
  tooltipEl.style.top = `${ty}px`;
}

function hideTooltip() {
  tooltipEl.classList.add('hidden');
}

window.addEventListener('pointermove', (e) => {
  if (!draggedPoke) return;

  const fieldRect = fieldEl.getBoundingClientRect();
  let nx = e.clientX - fieldRect.left - dragOffset.x;
  let ny = e.clientY - fieldRect.top - dragOffset.y;

  nx = Math.max(0, Math.min(fieldRect.width - POKE_SIZE, nx));
  ny = Math.max(0, Math.min(fieldRect.height - POKE_SIZE, ny));

  draggedPoke.x = nx;
  draggedPoke.y = ny;
  draggedPoke.el.style.left = `${nx}px`;
  draggedPoke.el.style.top = `${ny}px`;

  if (!tooltipEl.classList.contains('hidden')) updateTooltipPos(e.clientX, e.clientY);
});

window.addEventListener('pointerup', () => {
  clearTimeout(pressTimer);
  hideTooltip();

  if (!draggedPoke) return;

  const current = draggedPoke;
  draggedPoke = null;
  current.isDragging = false;

  for (let other of pokemons) {
    if (other === current) continue;
    const dx = (current.x + 45) - (other.x + 45);
    const dy = (current.y + 45) - (other.y + 45);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 55) {
      if (current.isAdopted || other.isAdopted) {
        showFloatingMsg("🚫 입양 포켓몬은 합체할 수 없어!", current.x, current.y);
        saveFieldState();
        return;
      }

      mergePokemon(current, other);
      return;
    }
  }

  saveFieldState();
});

function mergePokemon(p1, p2) {
  if (p1.isAdopted || p2.isAdopted) return;

  const nextId = p1.id + p2.id;
  if (nextId > MAX_DEX) {
    showFloatingMsg("🚫 최대 도감 번호 초과!", midX, midY);
    return;
  }

  let nextIsShiny = null;
  if (p1.isShiny || p2.isShiny) {
    nextIsShiny = Math.random() < 0.5;
  }

  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  removePokemon(p1);
  removePokemon(p2);
  spawnPokemon(nextId, midX, midY, nextIsShiny, false);
}

function releasePokemon(poke) {
  if (poke.isAdopted) {
    showFloatingText(`🌿 자연 방생! (입양 개체 +0C)`, poke.x - 10, poke.y, false, true);
  } else {
    const multiplier = poke.isShiny ? 2 : 1;
    const gain = poke.id * multiplier;
    addCoins(gain);

    if (poke.isShiny) {
      showFloatingText(`✨ +${gain} 코인! (이로치 2배!) ✨`, poke.x - 10, poke.y, true, false);
    } else {
      showFloatingText(`+${gain} 코인!`, poke.x + 15, poke.y, false, false);
    }
  }
  removePokemon(poke);
}

function removePokemon(poke) {
  const idx = pokemons.indexOf(poke);
  if (idx !== -1) {
    pokemons.splice(idx, 1);
    poke.el.remove();
  }
  updateHUD();
  saveFieldState();
}

function showFloatingText(text, x, y, isShiny = false, isAdopted = false) {
  const floatEl = document.createElement('div');
  floatEl.className = `floating-coin ${isShiny ? 'shiny' : ''} ${isAdopted ? 'adopted' : ''}`;
  floatEl.innerText = text;
  floatEl.style.left = `${x}px`;
  floatEl.style.top = `${y}px`;
  fieldEl.appendChild(floatEl);
  setTimeout(() => floatEl.remove(), isShiny ? 1200 : 800);
}

function showFloatingMsg(text, x, y) {
  const floatEl = document.createElement('div');
  floatEl.className = 'floating-msg';
  floatEl.innerText = text;
  floatEl.style.left = `${x}px`;
  floatEl.style.top = `${y}px`;
  fieldEl.appendChild(floatEl);
  setTimeout(() => floatEl.remove(), 1200);
}

function updateHUD() {
  coinEl.innerText = coins.toLocaleString();
  fieldCountEl.innerText = pokemons.length;
  maxCountEl.innerText = maxField;
  dexCountEl.innerText = discovered.size;
  modalDexCountEl.innerText = discovered.size;
  modalInspectCountEl.innerText = inspected.size;

  const nextUpgrade = FIELD_UPGRADES.find(u => u.target > maxField);
  if (nextUpgrade) {
    expandBtnEl.className = 'expand-hud-btn';
    expandBtnEl.innerText = `➕ 확장 (${nextUpgrade.cost}C)`;
  } else {
    expandBtnEl.className = 'expand-hud-btn disabled';
    expandBtnEl.innerText = `최대 확장 (30마리)`;
  }
}

// ================= 📖 도감 모달 & 드래그 스크롤 =================

genTabsEl.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isTabDown = true;
  hasDraggedTabs = false;
  startTabX = e.pageX - genTabsEl.offsetLeft;
  startScrollLeft = genTabsEl.scrollLeft;
});

function initGenTabs() {
  genTabsEl.innerHTML = '';
  GENERATIONS.forEach((gen, idx) => {
    const btn = document.createElement('button');
    btn.className = `gen-tab-btn ${idx === currentGenIndex ? 'active' : ''}`;
    btn.innerText = gen.name;
    btn.addEventListener('click', () => {
      if (hasDraggedTabs) return;

      currentGenIndex = idx;
      document.querySelectorAll('.gen-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPokedexGrid();
    });
    genTabsEl.appendChild(btn);
  });
}

pokedexGridEl.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isGridDown = true;
  hasDraggedGrid = false;
  startGridY = e.pageY;
  startScrollTop = pokedexGridEl.scrollTop;
});

window.addEventListener('mousemove', (e) => {
  if (isGridDown) {
    const dy = e.pageY - startGridY;
    if (Math.abs(dy) > 5) {
      hasDraggedGrid = true;
    }
    pokedexGridEl.scrollTop = startScrollTop - dy;
  }

  if (isTabDown) {
    const x = e.pageX - genTabsEl.offsetLeft;
    const dx = x - startTabX;
    if (Math.abs(dx) > 5) {
      hasDraggedTabs = true;
    }
    genTabsEl.scrollLeft = startScrollLeft - dx;
  }
});

window.addEventListener('mouseup', () => {
  isGridDown = false;
  isTabDown = false;
});

async function renderPokedexGrid() {
  pokedexGridEl.innerHTML = '';
  const gen = GENERATIONS[currentGenIndex];
  const fragment = document.createDocumentFragment();

  for (let id = gen.start; id <= gen.end; id++) {
    const isUnlocked = discovered.has(id);
    const isShinyUnlocked = shinyDiscovered.has(id);
    const isInspected = inspected.has(id);

    const card = document.createElement('div');
    card.className = `dex-card ${isUnlocked ? 'discovered' : 'locked'} ${isShinyUnlocked ? 'shiny-unlocked' : ''}`;

    const numSpan = document.createElement('span');
    numSpan.className = 'card-number';
    numSpan.innerText = `#${id}`;

    const img = document.createElement('img');
    img.src = getSpriteUrl(id, isShinyUnlocked);
    img.loading = 'lazy';
    img.draggable = false;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'card-name';

    if (isUnlocked) {
      if (pokeCache[id]) {
        nameSpan.innerText = pokeCache[id].name;
      } else {
        nameSpan.innerText = '확인 중...';
        getPokemonData(id).then(data => { nameSpan.innerText = data.name; });
      }

      card.addEventListener('click', () => {
        if (!hasDraggedGrid) {
          openDetailModal(id);
        }
      });
    } else {
      nameSpan.innerText = '???';
    }

    if (isShinyUnlocked) {
      const star = document.createElement('span');
      star.className = 'shiny-star-badge';
      star.innerText = '★';
      card.appendChild(star);
    }

    if (isInspected) {
      const check = document.createElement('span');
      check.className = 'inspected-badge';
      check.innerText = '✔';
      check.title = '조사 완료!';
      card.appendChild(check);
    }

    card.appendChild(numSpan);
    card.appendChild(img);
    card.appendChild(nameSpan);
    fragment.appendChild(card);
  }
  pokedexGridEl.appendChild(fragment);
}

function openPokedex() {
  pokedexModalEl.classList.remove('hidden');
  initGenTabs();
  renderPokedexGrid();
}

function closePokedex() {
  pokedexModalEl.classList.add('hidden');
}

// ================= 🔍 상세 프로필 모달 =================
async function openDetailModal(id) {
  currentDetailId = id;
  const isShinyUnlocked = shinyDiscovered.has(id);

  detailDexEl.innerText = `#${id}`;
  detailNameEl.innerText = '정보 로딩 중...';
  detailGenusEl.innerText = '';
  detailTypesEl.innerHTML = '';
  detailHeightEl.innerText = '- m';
  detailWeightEl.innerText = '- kg';
  detailFlavorEl.innerText = '도감 데이터를 받아오고 있습니다...';

  detailImgEl.onerror = function() {
    if (this.src.includes('official-artwork/shiny')) {
      this.src = getOfficialArtworkUrl(id, false);
    } else if (this.src.includes('official-artwork')) {
      this.src = getSpriteUrl(id, isShinyUnlocked);
    } else {
      this.onerror = null;
    }
  };
  detailImgEl.src = getOfficialArtworkUrl(id, isShinyUnlocked);

  const isFirstInspect = !inspected.has(id);
  if (isFirstInspect) {
    inspected.add(id);
    localStorage.setItem('poke_inspected', JSON.stringify(Array.from(inspected)));
    addCoins(INSPECT_REWARD);
    showFloatingMsg(`🎉 도감 조사 완료! +${INSPECT_REWARD} 코인 지급!`, 300, 160);
    renderPokedexGrid();
  }

  detailModalEl.classList.remove('hidden');

  const data = await getPokemonData(id);
  detailNameEl.innerText = data.name + (isShinyUnlocked ? ' ✨' : '');
  detailGenusEl.innerText = data.genus;
  detailHeightEl.innerText = `${data.height} m`;
  detailWeightEl.innerText = `${data.weight} kg`;
  detailFlavorEl.innerText = data.flavor;

  detailTypesEl.innerHTML = '';
  data.types.forEach(tKey => {
    const typeInfo = TYPE_CONFIG[tKey] || { name: tKey, color: '#888' };
    const pill = document.createElement('span');
    pill.className = 'type-pill';
    pill.style.backgroundColor = typeInfo.color;
    pill.innerText = typeInfo.name;
    detailTypesEl.appendChild(pill);
  });
}

function closeDetail() {
  detailModalEl.classList.add('hidden');
  currentDetailId = null;
}

function playCurrentDetailCry() {
  if (currentDetailId) {
    try {
      const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentDetailId}.ogg`);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  }
}

// ================= 💾 세이브 백업 & 복원 =================
function exportSaveData() {
  saveFieldState();
  const saveData = {
    coins: coins,
    maxField: maxField,
    discovered: Array.from(discovered),
    shiny: Array.from(shinyDiscovered),
    inspected: Array.from(inspected),
    field: JSON.parse(localStorage.getItem('poke_field_pokemons') || '[]'),
    soundMuted: isSoundMuted
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(saveData)));

  navigator.clipboard.writeText(encoded).then(() => {
    showFloatingMsg("📋 백업 코드가 복사되었어!", 300, 160);
  }).catch(() => {
    prompt("아래 백업 코드를 복사해서 메모장에 보관해 둬!", encoded);
  });
}

function importSaveData() {
  const code = prompt("보관해 둔 백업 코드를 여기에 붙여넣어 줘!");
  if (!code) return;
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(code.trim())));
    if (!decoded.discovered || !Array.isArray(decoded.discovered)) throw new Error();

    localStorage.setItem('poke_coins', decoded.coins || 0);
    localStorage.setItem('poke_max_field', decoded.maxField || 5);
    localStorage.setItem('poke_discovered', JSON.stringify(decoded.discovered));
    localStorage.setItem('poke_shiny_discovered', JSON.stringify(decoded.shiny || []));
    localStorage.setItem('poke_inspected', JSON.stringify(decoded.inspected || []));
    localStorage.setItem('poke_field_pokemons', JSON.stringify(decoded.field || []));
    localStorage.setItem('poke_sound_muted', !!decoded.soundMuted);

    isResetting = true;
    alert("🎉 데이터 복원 완료! 게임을 새로고침할게!");
    location.reload();
  } catch (e) {
    alert("⚠️ 올바르지 않은 백업 코드야! 코드를 다시 확인해 줘.");
  }
}

// ================= 📜 룰북 & 설정 모달 =================
function openRulebook() {
  rulebookModalEl.classList.remove('hidden');
}

function closeRulebook() {
  rulebookModalEl.classList.add('hidden');
}

function openSettings() {
  updateSettingsUI();
  settingsModalEl.classList.remove('hidden');
}

function closeSettings() {
  settingsModalEl.classList.add('hidden');
}

function toggleSound() {
  isSoundMuted = !isSoundMuted;
  localStorage.setItem('poke_sound_muted', isSoundMuted);
  updateSettingsUI();
}

function updateSettingsUI() {
  if (isSoundMuted) {
    soundBtnEl.className = 'toggle-btn off';
    soundBtnEl.innerText = '꺼짐 (OFF)';
  } else {
    soundBtnEl.className = 'toggle-btn on';
    soundBtnEl.innerText = '켜짐 (ON)';
  }
}

function resetGameData() {
  const answer = confirm("⚠️ 정말로 모든 포켓몬 도감, 조사 기록, 목장 확장 레벨, 코인, 필드 포켓몬을 초기화할 거야?\n(지워진 데이터는 절대 복구할 수 없어!)");
  if (!answer) return;

  isResetting = true;
  window.removeEventListener('beforeunload', saveFieldState);
  localStorage.clear();
  pokemons.length = 0;
  location.reload();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!detailModalEl.classList.contains('hidden')) {
      closeDetail();
    } else {
      closePokedex();
      closeRulebook();
      closeSettings();
    }
  }
});

// 🛡️ [철벽 백드롭 판정 장치]: 누를 때도 바깥 배경 + 뗄 때도 바깥 배경일 때만 닫기!
function setupModalBackdropClose(modalEl, closeFn) {
  let isDownOnBackdrop = false;

  modalEl.addEventListener('mousedown', (e) => {
    isDownOnBackdrop = (e.target === modalEl);
  });

  modalEl.addEventListener('mouseup', (e) => {
    if (isDownOnBackdrop && e.target === modalEl) {
      closeFn();
    }
    isDownOnBackdrop = false;
  });
}

setupModalBackdropClose(pokedexModalEl, closePokedex);
setupModalBackdropClose(detailModalEl, closeDetail);
setupModalBackdropClose(rulebookModalEl, closeRulebook);
setupModalBackdropClose(settingsModalEl, closeSettings);

window.addEventListener('beforeunload', () => {
  if (!isResetting) {
    saveFieldState();
  }
});

function updateField() {
  const fieldRect = fieldEl.getBoundingClientRect();
  for (let p of pokemons) {
    if (p.isDragging) continue;

    p.changeTimer++;
    if (p.changeTimer > 120 + Math.random() * 60) {
      p.vx = (Math.random() - 0.5) * 0.7;
      p.vy = (Math.random() - 0.5) * 0.7;
      p.changeTimer = 0;
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x <= 0 || p.x >= fieldRect.width - POKE_SIZE) p.vx *= -1;
    if (p.y <= 0 || p.y >= fieldRect.height - POKE_SIZE) p.vy *= -1;

    p.el.style.left = `${p.x}px`;
    p.el.style.top = `${y = p.y}px`;
  }
  requestAnimationFrame(updateField);
}

updateHUD();
updateSettingsUI();
loadFieldState();
requestAnimationFrame(updateField);