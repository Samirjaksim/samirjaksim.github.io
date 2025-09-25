// js/ui.js - 화면(DOM)을 조작하는 모든 코드를 담당합니다.

// dragDrop 모듈에서 dropzone 이벤트 설정 함수를 가져옵니다.
import { addDropzoneEvents } from './dragDrop.js';

const IMAGE_BASE_URL = 'https://v-archive.net';

/**
 * 주어진 곡 목록을 화면에 렌더링(이미지로 표시)하는 함수
 * @param {Array} songsToRender - 렌더링할 곡 정보 배열
 * @param {HTMLElement} container - 이미지를 추가할 부모 요소
 * @param {string} selectedDifficulty - 필터에서 선택된 난이도 (예: "NM", "HD")
 */

export function renderSongs(songsToRender, container, selectedDifficulty) {
    container.innerHTML = ''; // 기존 목록을 깨끗이 비웁니다.

    songsToRender.forEach(song => {
        const img = document.createElement('img');

        // ▼▼▼▼▼ 1. 중복 추가를 위해 ID를 고유하게 만듭니다. ▼▼▼▼▼
        // 예: song-5 -> song-5-NM
        img.id = `song-${song.title}-${selectedDifficulty}`;
        
        img.src = `${IMAGE_BASE_URL}/static/images/jackets/${song.title}.jpg`;
        img.alt = song.name;
        img.title = song.name;
        
        // ▼▼▼▼▼ 2. 기본 클래스와 함께 난이도별 테두리 클래스를 추가합니다. ▼▼▼▼▼
        img.className = `draggable border-${selectedDifficulty.toLowerCase()}`;
        
        img.draggable = true;
        container.appendChild(img);
    });
}

// 새로운 티어 줄을 생성하고 DOM에 추가하는 함수
function addTierRow(container) {
    const newTierRow = document.createElement('div');
    newTierRow.className = 'tier-row';

    newTierRow.innerHTML = `
        <div class="tier-label" style="background-color: #cccccc;" contenteditable="true">티어</div>
        <div class="move-controls">
            <button class="move-up-btn">▲</button>
            <button class="move-down-btn">▼</button>
        </div>
        <button class="color-picker-btn">🎨</button>
        <button class="delete-tier-btn">×</button>
        <div class="tier-items" data-tier="new"></div>
    `;

    container.appendChild(newTierRow);

    // 새로 생성된 dropzone(.tier-items)에 드롭 이벤트를 활성화합니다.
    const newDropzone = newTierRow.querySelector('.tier-items');
    addDropzoneEvents(newDropzone);
}

// 티어 추가/삭제 버튼 이벤트를 초기화하는 함수
export function initializeTierControls() {
    const tierContainer = document.getElementById('tier-container');
    const addTierBtn = document.getElementById('add-tier-btn');

    // '티어 추가' 버튼 클릭 이벤트
    addTierBtn.addEventListener('click', () => {
        addTierRow(tierContainer);
    });

    // '티어 삭제'는 이벤트 위임을 사용 (컨테이너에 이벤트 리스너 1개만 설정)
    tierContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-tier-btn')) {
            // 클릭된 버튼의 가장 가까운 부모 .tier-row를 찾아 삭제
            e.target.closest('.tier-row').remove();
        }
    });
}