// js/main.js - 애플리케이션의 메인 로직을 담당합니다.

// 다른 모듈에서 필요한 함수들을 가져옵니다.
import { fetchAllSongs } from './api.js';
import { renderSongs, initializeTierControls } from './ui.js';
import { initializeDraggables, initializeDropzones } from './dragDrop.js';

document.addEventListener('DOMContentLoaded', () => {
    // 주요 DOM 요소들
    const levelSelect = document.getElementById('level-select');
    const filterBtn = document.getElementById('filter-btn');
    const unrankedContainer = document.querySelector('.unranked-items');
    const tierContainer = document.getElementById('tier-container');
    const colorPalette = document.getElementById('color-palette');

    // 팔레트에 사용할 색상 배열 정의
    const paletteColors = [
        '#ff7f7f', '#ffbf7f', '#ffdf7f', '#ffff7f', '#bfff7f', '#7fff7f', 
        '#7fffff', '#7fbfff', '#7f7fff', '#bf7fff', '#ff7fff', '#df7fdf',
        '#4c4c4c', '#999999', '#cccccc', '#ffffff'
    ];

    let allSongs = []; // 모든 곡 정보를 저장할 배열
    let currentEditingLabel = null; // 현재 색상을 변경 중인 티어 라벨을 추적

    // 팔레트에 색상 견본(swatch)들을 채워넣는 함수
    function populateColorPalette() {
        paletteColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color; // 데이터 속성에 색상 값 저장
            colorPalette.appendChild(swatch);
        });
    }

    // 레벨 선택 <select>에 1부터 15까지의 <option>을 생성하는 함수
    function populateLevelSelector() {
        for (let i = 1; i <= 15; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            levelSelect.appendChild(option);
        }
    }

    // 애플리케이션 초기화 함수
    async function init() {
        populateLevelSelector();
        initializeDropzones();
        initializeTierControls();
        populateColorPalette(); // 팔레트 초기화

        // API로부터 모든 곡 정보를 가져와 변수에 저장
        allSongs = await fetchAllSongs();
        if (allSongs.length > 0) {
            console.log(`${allSongs.length}개의 곡 정보 로딩 완료.`);
        } else {
            unrankedContainer.innerHTML = '<p style="color: red;">오류: 곡 목록을 불러올 수 없습니다.</p>';
        }
    }

    // '필터 적용' 버튼 클릭 이벤트 리스너
    filterBtn.addEventListener('click', () => {
        const selectedButton = document.querySelector('input[name="button-type"]:checked').value;
        const selectedDifficulty = document.querySelector('input[name="difficulty-type"]:checked').value;
        const selectedLevel = parseInt(levelSelect.value, 10);

        const filteredSongs = allSongs.filter(song => {
            // 1. 기존 필터 조건(버튼, 난이도, 레벨)이 맞는지 확인합니다.
            const matchesFilter = (
                song.patterns &&
                song.patterns[selectedButton] &&
                song.patterns[selectedButton][selectedDifficulty] &&
                song.patterns[selectedButton][selectedDifficulty].level === selectedLevel
            );

            // 필터 조건에 맞지 않으면 즉시 제외합니다.
            if (!matchesFilter) {
                return false;
            }

            // 2. 필터 조건에 맞다면, 해당 곡이 이미 티어표에 있는지 확인합니다.
            const uniqueId = `song-${song.title}-${selectedDifficulty}`;
            const element = document.getElementById(uniqueId);
            const isAlreadyPlacedInTier = element && tierContainer.contains(element);
            return !isAlreadyPlacedInTier;
        });

        if (filteredSongs.length > 0) {
            renderSongs(filteredSongs, unrankedContainer, selectedDifficulty);
        } else {
            unrankedContainer.innerHTML = '<p>해당 조건에 맞는 곡이 없거나, 모두 티어표에 배치되었습니다.</p>';
        }
        
        initializeDraggables();
    });

    // 자켓 우클릭 삭제 기능 (이벤트 위임)
    tierContainer.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('draggable')) {
            e.preventDefault();
            e.target.remove();
        }
    });

    // 티어 컨테이너 내 클릭 이벤트 핸들러 (이벤트 위임)
    tierContainer.addEventListener('click', (e) => {
        const target = e.target;

        // 색상 설정 버튼을 클릭했을 때
        if (e.target.classList.contains('color-picker-btn')) {
            const button = e.target;
            currentEditingLabel = button.closest('.tier-row').querySelector('.tier-label');
            
            // 버튼 위치를 기준으로 팔레트 위치 설정
            const rect = button.getBoundingClientRect();
            colorPalette.style.top = `${window.scrollY + rect.bottom + 5}px`;
            // 팔레트의 중앙이 버튼의 중앙에 오도록 left 값 조정
            colorPalette.style.left = `${window.scrollX + rect.left - (colorPalette.offsetWidth / 2) + (rect.width / 2)}px`;

            colorPalette.classList.remove('hidden');
        }

        if (target.classList.contains('move-up-btn')) {
            const currentRow = target.closest('.tier-row');
            const previousRow = currentRow.previousElementSibling;
            // 이전 형제가 있고, 그것이 tier-row일 경우에만 실행
            if (previousRow && previousRow.classList.contains('tier-row')) {
                tierContainer.insertBefore(currentRow, previousRow);
            }
        }

        if (target.classList.contains('move-down-btn')) {
            const currentRow = target.closest('.tier-row');
            const nextRow = currentRow.nextElementSibling;
            // 다음 형제가 있고, 그것이 tier-row일 경우에만 실행
            if (nextRow && nextRow.classList.contains('tier-row')) {
                // nextRow를 currentRow 앞으로 삽입하면 currentRow가 아래로 밀려남
                tierContainer.insertBefore(nextRow, currentRow);
            }
        }
    });

    tierContainer.addEventListener('input', (e) => {
        const target = e.target;
        // 이벤트가 .tier-label에서 발생했고, contentEditable 상태일 때만 실행
        if (target.classList.contains('tier-label') && target.isContentEditable) {
            
            // 1. 현재 커서 위치를 저장합니다.
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const caretPos = range.startOffset;

            // 2. HTML 태그를 모두 제거한 순수 텍스트만 가져옵니다.
            const cleanText = target.textContent;

            // 3. 순수 텍스트로 내부 HTML을 교체합니다.
            target.innerHTML = cleanText;

            // 4. 저장했던 커서 위치를 복원합니다.
            //    (텍스트 노드가 재생성되었으므로 다시 설정해야 함)
            const newRange = document.createRange();
            // target.firstChild가 null이 아닐 때만 실행하여 에러 방지
            if (target.firstChild) {
                // 커서 위치가 텍스트 길이를 넘어가지 않도록 보정
                const newCaretPos = Math.min(caretPos, cleanText.length);
                newRange.setStart(target.firstChild, newCaretPos);
                newRange.collapse(true); // 범위를 커서로 만듦
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    });

    // 색상 팔레트에서 색상을 클릭했을 때의 이벤트 핸들러
    colorPalette.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-swatch')) {
            const selectedColor = e.target.dataset.color;
            if (currentEditingLabel) {
                currentEditingLabel.style.backgroundColor = selectedColor;
            }
            colorPalette.classList.add('hidden');
            currentEditingLabel = null; // 편집 상태 초기화
        }
    });

    // 팔레트 바깥을 클릭하면 팔레트가 닫히도록 하는 이벤트 핸들러
    window.addEventListener('click', (e) => {
        // 팔레트가 열려있고, 클릭한 대상이 색상 버튼이나 팔레트 자신이 아닐 때
        if (!colorPalette.classList.contains('hidden') && 
            !e.target.matches('.color-picker-btn') && 
            !colorPalette.contains(e.target)) {
            colorPalette.classList.add('hidden');
            currentEditingLabel = null;
        }
    });

    // 애플리케이션 시작
    init();
});