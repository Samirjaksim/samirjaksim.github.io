// 이 파일에서 사용할 전역 변수
let currentScore = 0;
let currentLeftCardData = null;
let currentRightCardData = null;
let selectedButtonMode = null; // app.js에서 모드 선택 시 설정됨

// HARD_MODE_DIFFERENCE는 constants.js에 정의되어 있고, DOM.hardModeCheckbox는 dom.js에 있음

function startGame() {
    currentScore = 0;
    updateScoreDisplay(); // ui.js
    enableButtons(true);
    showScreen('game'); // ui.js
    assignNewCards();
}

function assignNewCards() {
    // currentGamePlayableData는 data.js에서 필터링된 후 사용됨
    currentLeftCardData = getRandomProblem(currentGamePlayableData, null, null); 
    
    if (!currentLeftCardData) {
        gameOver("문제를 생성할 수 없습니다. 선택하신 모드/설정에 유효한 데이터가 부족합니다.");
        return;
    }

    // 오른쪽 카드는 왼쪽 카드의 floor 값을 기준으로 하드 모드 등을 적용하여 선택
    currentRightCardData = getRandomProblem(currentGamePlayableData, currentLeftCardData, currentLeftCardData.floor);

    if (!currentRightCardData) {
        let gameOverMsg = `'${currentLeftCardData.name}' (${currentLeftCardData.buttonMode} ${currentLeftCardData.patternType}) 와 비교할 다른 Floor 값의 곡이 없습니다.`;
        if (DOM.hardModeCheckbox.checked) {
            gameOverMsg += ` (하드 모드 조건 포함)`;
        }
        gameOver(gameOverMsg);
        return;
    }

    displayCard(DOM.leftCardEl, currentLeftCardData, false); // ui.js, dom.js
    displayCard(DOM.rightCardEl, currentRightCardData, true); // ui.js, dom.js
}

function getRandomProblem(dataPool, excludeCardData, excludeFloorValue) {
    if (!dataPool || dataPool.length === 0) return null;

    let candidatePool = [...dataPool];

    // 1. 기본 필터링 (excludeCardData: 이전에 나왔던 카드, excludeFloorValue: 비교 대상의 floor 값)
    if (excludeCardData) { 
        candidatePool = candidatePool.filter(item => {
            // 같은 ID 제외
            if (item.id === excludeCardData.id) return false;
            // 같은 곡, 같은 버튼 모드의 다른 패턴 제외
            if (item.name === excludeCardData.name && item.buttonMode === excludeCardData.buttonMode) {
                return false;
            }
            // excludeFloorValue와 floor 값이 같은 카드 제외 (오른쪽 카드 선택 시)
            if (excludeFloorValue !== null && typeof excludeFloorValue === 'number' && item.floor === excludeFloorValue) {
                return false;
            }
            return true;
        });
    } else if (excludeFloorValue !== null && typeof excludeFloorValue === 'number') {
         // 왼쪽 카드 선택 후 오른쪽 카드 선택 시, excludeCardData는 아직 없지만 floor 값은 같은 것을 피해야 함
         candidatePool = candidatePool.filter(item => item.floor !== excludeFloorValue);
    }

    // 2. 하드 모드 필터링 (오른쪽 카드 선택 시, 즉 excludeFloorValue가 있을 때)
    // excludeFloorValue는 왼쪽 카드의 floor 값임
    if (DOM.hardModeCheckbox.checked && excludeFloorValue !== null && typeof excludeFloorValue === 'number' && candidatePool.length > 0) {
        const hardModeFilteredPool = candidatePool.filter(item => {
            const floorDiff = Math.abs(item.floor - excludeFloorValue);
            // HARD_MODE_DIFFERENCE (constants.js) 이내이고, 정확히 같지는 않은 것 (0.001은 부동소수점 오차 및 동일값 확실히 제외)
            return floorDiff <= HARD_MODE_DIFFERENCE && floorDiff > 0.001; 
        });

        if (hardModeFilteredPool.length > 0) {
            candidatePool = hardModeFilteredPool;
        } else {
            // 하드 모드 조건에 맞는 카드가 없으면 콘솔에 경고하고, 현재 candidatePool (기본 필터링된 풀)을 그대로 사용
            console.warn(`Hard mode: No patterns found within ±${HARD_MODE_DIFFERENCE} of ${excludeFloorValue}. Using general pool for this turn.`);
        }
    }
    
    // 3. 최종 후보군이 없으면 규칙 완화 시도 (동일 ID, 동일 floor만 제외)
    if (candidatePool.length === 0) {
        // console.warn("No suitable card found after primary/hardcore filtering. Trying less restrictive filter...");
        // dataPool (필터링 전 원본에 가까운 풀)에서 다시 시도
        candidatePool = dataPool.filter(item => {
            if (excludeCardData && item.id === excludeCardData.id) return false; // 왼쪽 카드와 완전히 동일한 것 제외
            if (excludeFloorValue !== null && typeof excludeFloorValue === 'number' && item.floor === excludeFloorValue) return false; // 왼쪽 카드와 floor가 같은 것 제외
            // "같은 곡, 같은 버튼 모드의 다른 패턴 제외" 규칙은 완화 단계에서 제거
            return true;
        });

        if (candidatePool.length === 0) {
             // 완화해도 후보가 없으면 null 반환
             return null; 
        }
    }
    
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[randomIndex];
}

function handleGuess(isHigherGuess) {
    if (!currentLeftCardData || !currentRightCardData) {
        gameOver("오류가 발생했습니다. 게임을 다시 시작해주세요.");
        return;
    }

    enableButtons(false); 

    // 오른쪽 카드 정보 공개
    DOM.rightCardEl.querySelector('.level-info .level-value').textContent = currentRightCardData.level;
    DOM.rightCardEl.querySelector('.floor-info .floor-value').textContent = currentRightCardData.floor.toFixed(1);
    
    const rightJacketImgEl = DOM.rightCardEl.querySelector('.album-jacket');
    if (currentRightCardData && typeof currentRightCardData.titleId !== 'undefined') {
        const rightImageUrl = `${JACKET_BASE_URL}${currentRightCardData.titleId}.jpg`;
        rightJacketImgEl.src = rightImageUrl;
        rightJacketImgEl.style.display = 'block';
        rightJacketImgEl.onerror = function() { this.src = DEFAULT_JACKET_URL; };
    }

    // 판정
    const leftFloor = currentLeftCardData.floor;
    const rightFloor = currentRightCardData.floor;
    let correct = false;

    if (isHigherGuess) {
        correct = rightFloor > leftFloor;
    } else {
        correct = rightFloor < leftFloor;
    }

    // 결과 처리
    if (correct) {
        currentScore++;
        updateScoreDisplay(); // ui.js
        
        setTimeout(() => {
            currentLeftCardData = currentRightCardData; // 오른쪽 카드가 다음 왼쪽 카드가 됨
            // 새 오른쪽 카드 선택
            currentRightCardData = getRandomProblem(currentGamePlayableData, currentLeftCardData, currentLeftCardData.floor); 

            if (!currentRightCardData) {
                let gameOverMsg = "더 이상 비교할 곡이 없습니다! 대단해요!";
                 if (DOM.hardModeCheckbox.checked) {
                    gameOverMsg += ` (하드 모드 조건 포함)`;
                }
                gameOver(gameOverMsg);
                return;
            }
            displayCard(DOM.leftCardEl, currentLeftCardData, false); // ui.js
            displayCard(DOM.rightCardEl, currentRightCardData, true); // ui.js (오른쪽은 다시 숨김)
            enableButtons(true);
        }, 1000);

    } else {
        setTimeout(() => {
             gameOver(); // 오답 시 게임 오버
        }, 500);
    }
}

function gameOver(customMessage = "") {
    DOM.finalScoreEl.textContent = currentScore;
    if (customMessage) {
        DOM.answerRevealEl.innerHTML = customMessage;
    } else {
        const leftData = currentLeftCardData;
        const rightData = currentRightCardData;
        let relation = "";
        if (rightData && leftData) { // 두 카드 데이터가 모두 있어야 비교 메시지 생성
            if (rightData.floor > leftData.floor) relation = `<strong>높았습니다</strong> (L: ${leftData.floor.toFixed(1)}, R: ${rightData.floor.toFixed(1)})`;
            else if (rightData.floor < leftData.floor) relation = `<strong>낮았습니다</strong> (L: ${leftData.floor.toFixed(1)}, R: ${rightData.floor.toFixed(1)})`;
            
            DOM.answerRevealEl.innerHTML = `
                아쉽네요! <strong>${rightData.name} (${rightData.buttonMode} ${rightData.patternType})</strong>의 세부 난이도는<br>
                <strong>${leftData.name} (${leftData.buttonMode} ${leftData.patternType})</strong>보다 ${relation}.
            `;
        } else { 
             DOM.answerRevealEl.innerHTML = `게임이 종료되었습니다. 최종 점수: ${currentScore}`;
        }
    }
    showScreen('gameOver'); // ui.js
    enableButtons(false);
}

function enableButtons(enable) {
    DOM.upButton.disabled = !enable;
    DOM.downButton.disabled = !enable;
}