function showScreen(screenName) {
    DOM.modeSelectionScreen.classList.add('hidden');
    DOM.scoreBoardScreen.classList.add('hidden');
    DOM.gameAreaScreen.classList.add('hidden');
    DOM.controlsScreen.classList.add('hidden');
    DOM.gameOverMessageEl.classList.add('hidden');
    DOM.loadingMessageEl.classList.add('hidden');
    DOM.errorMessageEl.classList.add('hidden');
    DOM.currentModeDisplay.classList.add('hidden');

    switch (screenName) {
        case 'loading':
            DOM.loadingMessageEl.classList.remove('hidden');
            break;
        case 'modeSelection':
            DOM.modeSelectionScreen.classList.remove('hidden');
            break;
        case 'game':
            DOM.scoreBoardScreen.classList.remove('hidden');
            DOM.gameAreaScreen.classList.remove('hidden');
            DOM.controlsScreen.classList.remove('hidden');
            // 게임 화면 표시 시 현재 모드 정보 업데이트 및 표시
            updateCurrentModeDisplay(); 
            DOM.currentModeDisplay.classList.remove('hidden');
            break;
        case 'gameOver':
            DOM.scoreBoardScreen.classList.remove('hidden'); 
            DOM.gameAreaScreen.classList.remove('hidden');   
            DOM.gameOverMessageEl.classList.remove('hidden');
            // 게임 오버 시에도 현재 모드 정보는 계속 표시
            DOM.currentModeDisplay.classList.remove('hidden'); 
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
            console.warn(`Failed to load jacket for ${cardData.name} (ID: ${cardData.titleId}) at ${imageUrl}`);
        };
    } else {
        jacketImgEl.src = DEFAULT_JACKET_URL;
        jacketImgEl.alt = "앨범 자켓 없음";
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
    DOM.scoreEl.textContent = currentScore; // game.js의 currentScore 사용
}

function updateCurrentModeDisplay() {
    let modeText = selectedButtonMode === 'ALL' ? 'ALL Buttons' : selectedButtonMode;
    
    const options = [];
    if (DOM.scOnlyCheckbox.checked) {
        options.push("SC Only");
    }

    const minLevel = DOM.levelMinSelect.value; // select에서 값 가져오기
    const maxLevel = DOM.levelMaxSelect.value; // select에서 값 가져오기
    if (minLevel !== "" && maxLevel !== "") {
        options.push(`Lv ${minLevel}~${maxLevel}`);
    } else if (minLevel !== "") {
        options.push(`Lv ${minLevel}~`);
    } else if (maxLevel !== "") {
        options.push(`Lv ~${maxLevel}`);
    }

    if (DOM.hardModeCheckbox.checked) {
        options.push("Hard Mode (±1.0)"); // 하드 모드 기준 명시
    }

    if (options.length > 0) {
        modeText += ` (${options.join(', ')})`;
    }
    
    DOM.currentModeText.textContent = modeText;
}