// js/gameFlow.js

function startGame() {
    currentScore = 0; // gameState.js
    playedProblems = []; // gameState.js - 새 게임 시작 시 초기화
    
    if (DOM.easyModeCheckbox.checked) { // dom.js
        currentLives = EASY_MODE_LIVES; // gameState.js
    } else {
        currentLives = 1; // gameState.js
    }
    updateLivesDisplay(); // ui.js

    updateScoreDisplay(); // ui.js
    enableGameButtons(true); // 이 파일 내 함수
    showScreen('game'); // ui.js
    assignNewCards();
}

function assignNewCards() {
    // 왼쪽 카드 선택: playedProblems에 없는 새로운 문제여야 함
    currentLeftCardData = getRandomProblem(currentGamePlayableData, null, null, playedProblems); // gameLogic.js
    
    if (!currentLeftCardData) {
        if (playedProblems.length >= currentGamePlayableData.length && currentGamePlayableData.length > 0) {
             handleGameOver("축하합니다! 모든 문제를 클리어했습니다!");
        } else {
            handleGameOver("문제를 생성할 수 없습니다. (왼쪽 카드 생성 실패)");
        }
        return;
    }
    // 왼쪽 카드를 playedProblems에 즉시 추가
    if (!playedProblems.includes(currentLeftCardData.id)) {
        playedProblems.push(currentLeftCardData.id); // gameState.js
    }

    // 오른쪽 카드 선택: playedProblems에 없고, 왼쪽 카드와 규칙에 맞게 다른 새로운 문제여야 함
    currentRightCardData = getRandomProblem(currentGamePlayableData, currentLeftCardData, currentLeftCardData.floor, playedProblems); // gameLogic.js

    if (!currentRightCardData) {
        if (playedProblems.length >= currentGamePlayableData.length && currentGamePlayableData.length > 0) {
            handleGameOver("축하합니다! 모든 문제를 클리어했습니다!");
        } else {
            let gameOverMsg = `'${currentLeftCardData.name}' (${currentLeftCardData.buttonMode} ${currentLeftCardData.patternType}) 와 비교할 다른 새로운 곡이 없습니다.`;
             if (DOM.hardModeCheckbox.checked) { // dom.js
                gameOverMsg += ` (하드 모드 조건 포함)`;
            }
            handleGameOver(gameOverMsg);
        }
        return;
    }

    displayCard(DOM.leftCardEl, currentLeftCardData, false); // ui.js
    displayCard(DOM.rightCardEl, currentRightCardData, true); // ui.js
}

function handleGuess(isHigherGuess) {
    if (!currentLeftCardData || !currentRightCardData) { // gameState.js
        handleGameOver("오류가 발생했습니다. 게임을 다시 시작해주세요.");
        return;
    }

    enableGameButtons(false); 

    // 오른쪽 카드 정보 공개 (UI 업데이트)
    DOM.rightCardEl.querySelector('.level-info .level-value').textContent = currentRightCardData.level;
    DOM.rightCardEl.querySelector('.floor-info .floor-value').textContent = currentRightCardData.floor.toFixed(1);
    const rightJacketImgEl = DOM.rightCardEl.querySelector('.album-jacket');
    if (currentRightCardData && typeof currentRightCardData.titleId !== 'undefined') {
        const rightImageUrl = `${JACKET_BASE_URL}${currentRightCardData.titleId}.jpg`; // constants.js
        rightJacketImgEl.src = rightImageUrl;
        rightJacketImgEl.style.display = 'block';
        rightJacketImgEl.onerror = function() { this.src = DEFAULT_JACKET_URL; }; // constants.js
    }

    const leftFloor = currentLeftCardData.floor;
    const rightFloor = currentRightCardData.floor;
    let correct = false;

    if (isHigherGuess) correct = rightFloor > leftFloor;
    else correct = rightFloor < leftFloor;

    const feedbackCard = DOM.rightCardEl; // dom.js
    const animationDuration = 300; 
    const nextActionDelay = 700;   

    // ***** 핵심 변경: 정답/오답 처리 로직 통합 *****
    // 1. 현재 오른쪽 카드를 playedProblems에 추가 (이미 나왔던 문제로 처리)
    if (!playedProblems.includes(currentRightCardData.id)) {
        playedProblems.push(currentRightCardData.id);
    }

    if (correct) { // 정답 시
        feedbackCard.classList.add('correct-glow');
        currentScore++; // gameState.js
        updateScoreDisplay(); // ui.js
        
        setTimeout(() => {
            feedbackCard.classList.remove('correct-glow');
        }, animationDuration);

        // (목숨 차감 없음)

    } else { // 오답 시
        feedbackCard.classList.add('incorrect-glow');
        currentLives--; // 목숨 차감 (gameState.js)
        updateLivesDisplay(); // ui.js - 목숨 UI 업데이트

        setTimeout(() => {
            feedbackCard.classList.remove('incorrect-glow');
        }, animationDuration);
    }

    // 2. 다음 단계 진행 (목숨이 남아있거나, 정답일 경우)
    setTimeout(() => {
        if (currentLives > 0) { // 목숨이 남아있으면 (정답 시에는 currentLives는 변경되지 않았으므로 이 조건 통과)
            currentLeftCardData = currentRightCardData; // ***** 오른쪽 카드가 다음 왼쪽 카드가 됨 *****
            
            // 새로운 오른쪽 카드 선택 (이때 playedProblems에는 방금 왼쪽이 된 카드 포함)
            currentRightCardData = getRandomProblem(currentGamePlayableData, currentLeftCardData, currentLeftCardData.floor, playedProblems); // gameLogic.js

            if (!currentRightCardData) { // 더 이상 나올 카드가 없다면
                if (playedProblems.length >= currentGamePlayableData.length && currentGamePlayableData.length > 0) {
                    handleGameOver("축하합니다! 모든 문제를 클리어했습니다!");
                } else {
                    let gameOverMsg = "더 이상 비교할 곡이 없습니다! 대단해요!";
                    if (DOM.hardModeCheckbox.checked) gameOverMsg += ` (하드 모드 조건 포함)`; // dom.js
                    handleGameOver(gameOverMsg);
                }
                return;
            }
            // 새 카드들로 UI 업데이트
            displayCard(DOM.leftCardEl, currentLeftCardData, false); // ui.js
            displayCard(DOM.rightCardEl, currentRightCardData, true); // ui.js
            enableGameButtons(true);

        } else { // 목숨이 없으면 (오답으로 인해 0이 된 경우) 게임 오버
            handleGameOver(); 
        }
    }, nextActionDelay);
}

// handleGameOver, enableGameButtons 함수는 이전과 동일 (리더보드 로직 없음)
function handleGameOver(customMessage = "") {
    const existingNotice = DOM.gameOverMessageEl.querySelector('#advanced-option-notice');
    if (existingNotice) existingNotice.remove();

    DOM.finalScoreEl.textContent = currentScore;
    
    if (customMessage) {
        DOM.answerRevealEl.innerHTML = customMessage;
    } else {
        const leftData = currentLeftCardData;
        const rightData = currentRightCardData;
        let relation = "";
        if (rightData && leftData) {
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
    showScreen('gameOver');
    enableGameButtons(false);
}

function enableGameButtons(enable) {
    DOM.upButton.disabled = !enable;
    DOM.downButton.disabled = !enable;
}