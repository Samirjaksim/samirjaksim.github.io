// js/ui.js

function showScreen(screenName) {
    // 모든 주요 화면 섹션 기본 숨김 처리
    DOM.modeSelectionScreen.classList.add('hidden');
    DOM.scoreBoardScreen.classList.add('hidden');
    DOM.gameAreaScreen.classList.add('hidden');
    DOM.controlsScreen.classList.add('hidden');
    DOM.gameOverMessageEl.classList.add('hidden');
    DOM.loadingMessageEl.classList.add('hidden');
    DOM.errorMessageEl.classList.add('hidden');
    DOM.currentModeDisplay.classList.add('hidden');
    DOM.livesDisplay.classList.add('hidden'); // 목숨 표시도 기본 숨김

    // 리더보드 섹션은 이제 없으므로 관련 코드 제거
    // if (DOM.leaderboardSection) DOM.leaderboardSection.classList.add('hidden');


    switch (screenName) {
        case 'loading':
            DOM.loadingMessageEl.classList.remove('hidden');
            break;
        case 'modeSelection':
            DOM.modeSelectionScreen.classList.remove('hidden');
            // 모드 선택 화면에서는 목숨 표시 불필요
            break;
        case 'game':
            DOM.scoreBoardScreen.classList.remove('hidden');
            DOM.gameAreaScreen.classList.remove('hidden');
            DOM.controlsScreen.classList.remove('hidden');
            updateCurrentModeDisplay(); 
            DOM.currentModeDisplay.classList.remove('hidden');
            updateLivesDisplay(); // 현재 목숨 값으로 업데이트
            DOM.livesDisplay.classList.remove('hidden'); // 목숨 표시 보이기
            break;
        case 'gameOver':
            DOM.scoreBoardScreen.classList.remove('hidden'); 
            DOM.gameAreaScreen.classList.remove('hidden');   
            DOM.gameOverMessageEl.classList.remove('hidden');
            DOM.currentModeDisplay.classList.remove('hidden');
            // 게임 오버 시 목숨 표시 여부는 선택적 (현재는 숨겨진 상태 유지)
            // 만약 마지막 목숨 상태를 보여주고 싶다면:
            // updateLivesDisplay();
            // DOM.livesDisplay.classList.remove('hidden'); 
            break;
        case 'error':
            DOM.errorMessageEl.classList.remove('hidden');
            break;
    }
}

function displayCard(cardElement, cardData, hideDetails) {
    const jacketImgEl = cardElement.querySelector('.album-jacket');
    if (cardData && typeof cardData.titleId !== 'undefined') {
        const imageUrl = `${JACKET_BASE_URL}${cardData.titleId}.jpg`; // constants.js
        jacketImgEl.src = imageUrl;
        jacketImgEl.alt = `${cardData.name} 앨범 자켓`;
        jacketImgEl.style.display = 'block';
        jacketImgEl.onerror = function() {
            this.src = DEFAULT_JACKET_URL; // constants.js
            // console.warn(`Failed to load jacket for ${cardData.name} (ID: ${cardData.titleId}) at ${imageUrl}`);
        };
    } else {
        jacketImgEl.src = DEFAULT_JACKET_URL;
        jacketImgEl.alt = "앨범 자켓 없음";
        jacketImgEl.style.display = 'block'; // 자켓 없을 때도 공간은 차지하도록 (또는 none으로 숨김)
    }

    cardElement.querySelector('.song-title').textContent = cardData.name;
    cardElement.querySelector('.pattern-info').textContent = `${cardData.buttonMode} ${cardData.patternType}`;
    cardElement.querySelector('.composer-info .composer-value').textContent = cardData.composer || 'N/A';
    cardElement.querySelector('.dlc-info .dlc-value').textContent = cardData.dlc || 'N/A';

    if (hideDetails) {
        cardElement.querySelector('.level-info .level-value').textContent = `? (숨김)`;
        cardElement.querySelector('.floor-info .floor-value').textContent = `? (숨김)`;
    } else {
        cardElement.querySelector('.level-info .level-value').textContent = cardData.level;
        cardElement.querySelector('.floor-info .floor-value').textContent = cardData.floor.toFixed(1);
    }
}

function updateScoreDisplay() {
    if (DOM.scoreEl) { // DOM 요소 존재 확인
        DOM.scoreEl.textContent = currentScore; // gameState.js의 currentScore 참조

        // 점수 업데이트 시 시각적 효과
        DOM.scoreEl.classList.add('score-updated');
        setTimeout(() => {
            DOM.scoreEl.classList.remove('score-updated');
        }, 150); // CSS transition 시간과 일치 또는 약간 짧게
    } else {
        console.error("점수 표시 UI 요소를 찾을 수 없습니다. (scoreEl)");
    }
}

function updateCurrentModeDisplay() {
    if (!DOM.currentModeText || !DOM.easyModeCheckbox || !DOM.scOnlyCheckbox || !DOM.levelMinSelect || !DOM.levelMaxSelect || !DOM.hardModeCheckbox) {
        console.error("현재 모드 표시 또는 관련 옵션 UI 요소를 찾을 수 없습니다.");
        return;
    }

    let modeText = selectedButtonMode === 'ALL' ? 'ALL Buttons' : selectedButtonMode; // gameState.js
    
    const options = [];
    if (DOM.easyModeCheckbox.checked) {
        options.push("Easy Mode");
    }
    if (DOM.scOnlyCheckbox.checked) {
        options.push("SC Only");
    }

    const minLevel = DOM.levelMinSelect.value;
    const maxLevel = DOM.levelMaxSelect.value;
    if (minLevel !== "" && maxLevel !== "") {
        options.push(`Lv ${minLevel}~${maxLevel}`);
    } else if (minLevel !== "") {
        options.push(`Lv ${minLevel}~`);
    } else if (maxLevel !== "") {
        options.push(`Lv ~${maxLevel}`);
    }

    if (DOM.hardModeCheckbox.checked) {
        options.push("Hard Mode (±1.0 Floor)");
    }

    if (options.length > 0) {
        modeText += ` (${options.join(', ')})`;
    }
    
    DOM.currentModeText.textContent = modeText;
}

function updateLivesDisplay() {
    if (DOM.livesDisplay && DOM.livesCount) { // DOM 요소들이 존재하는지 확인
        DOM.livesCount.textContent = currentLives; // gameState.js의 currentLives 참조
        
        // 예를 들어, 하트 아이콘으로 목숨을 시각적으로 표시할 수도 있습니다.
        // let hearts = '';
        // for (let i = 0; i < currentLives; i++) {
        //    hearts += '❤️'; // 또는 다른 아이콘
        // }
        // DOM.livesCount.innerHTML = hearts; // textContent 대신 innerHTML 사용
    } else {
        // console.error("목숨 표시 UI 요소를 찾을 수 없습니다. (livesDisplay 또는 livesCount)");
        // 게임 시작 전에는 DOM이 없을 수 있으므로, 이 에러는 게임 시작 후에만 의미가 있음.
    }
}