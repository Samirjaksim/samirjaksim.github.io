// js/gameFlow.js

function startGame() {
    currentScore = 0; // gameState.js
    playedProblems = []; // gameState.js
    
    if (DOM.easyModeCheckbox.checked) { // dom.js
        currentLives = EASY_MODE_LIVES; // gameState.js (EASY_MODE_LIVES 상수 사용)
    } else {
        currentLives = 1; // gameState.js (기본 목숨)
    }
    updateLivesDisplay(); // ui.js - 초기 목숨 표시

    updateScoreDisplay(); // ui.js
    enableGameButtons(true); // 이 파일 내 함수
    showScreen('game'); // ui.js
    assignNewCards();
}

function assignNewCards() {
    currentLeftCardData = getRandomProblem(currentGamePlayableData, null, null, playedProblems); // gameLogic.js
    
    if (!currentLeftCardData) {
        if (playedProblems.length >= currentGamePlayableData.length && currentGamePlayableData.length > 0) {
             handleGameOver("축하합니다! 모든 문제를 클리어했습니다!");
        } else {
            handleGameOver("문제를 생성할 수 없습니다. (왼쪽 카드 생성 실패, 데이터 부족 가능성)");
        }
        return;
    }
    if (!playedProblems.includes(currentLeftCardData.id)) {
        playedProblems.push(currentLeftCardData.id); // gameState.js
    }

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
    const animationDuration = 300; // CSS의 animation-duration과 일치 (0.3초)
    const nextActionDelay = 700;   // 다음 액션까지의 전체 딜레이 (0.7초)

    if (correct) {
        feedbackCard.classList.add('correct-glow');
        currentScore++; // gameState.js
        updateScoreDisplay(); // ui.js
        
        setTimeout(() => {
            feedbackCard.classList.remove('correct-glow');
        }, animationDuration);

        setTimeout(() => {
            if (!playedProblems.includes(currentRightCardData.id)) { // gameState.js
                playedProblems.push(currentRightCardData.id);
            }
            currentLeftCardData = currentRightCardData; // gameState.js
            currentRightCardData = getRandomProblem(currentGamePlayableData, currentLeftCardData, currentLeftCardData.floor, playedProblems); // gameLogic.js

            if (!currentRightCardData) {
                if (playedProblems.length >= currentGamePlayableData.length && currentGamePlayableData.length > 0) {
                    handleGameOver("축하합니다! 모든 문제를 클리어했습니다!");
                } else {
                    let gameOverMsg = "더 이상 비교할 곡이 없습니다! 대단해요!";
                    if (DOM.hardModeCheckbox.checked) gameOverMsg += ` (하드 모드 조건 포함)`; // dom.js
                    handleGameOver(gameOverMsg);
                }
                return;
            }
            displayCard(DOM.leftCardEl, currentLeftCardData, false); // ui.js
            displayCard(DOM.rightCardEl, currentRightCardData, true); // ui.js
            enableGameButtons(true);
        }, nextActionDelay);

    } else { // 오답 시
        feedbackCard.classList.add('incorrect-glow');
        currentLives--; // 목숨 차감 (gameState.js)
        updateLivesDisplay(); // ui.js - 목숨 UI 업데이트

        setTimeout(() => {
            feedbackCard.classList.remove('incorrect-glow');
        }, animationDuration);

        setTimeout(() => {
            if (currentLives > 0) { // 목숨이 남아있으면
                assignNewCards(); 
                enableGameButtons(true);
            } else { // 목숨이 없으면 게임 오버
                handleGameOver(); 
            }
        }, nextActionDelay);
    }
}

function handleGameOver(customMessage = "") {
    // 게임 오버 메시지 영역에서 이전에 추가된 UI 요소들(예: 고급 설정 안내문)을 먼저 제거
    const existingNotice = DOM.gameOverMessageEl.querySelector('#advanced-option-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    // 리더보드 제출 영역도 이제 없으므로, 해당 ID를 가진 요소를 찾아서 제거할 필요는 없음
    // const existingSubmitArea = DOM.gameOverMessageEl.querySelector('#leaderboard-submit-area');
    // if (existingSubmitArea) {
    //     existingSubmitArea.remove();
    // }


    DOM.finalScoreEl.textContent = currentScore; // gameState.js
    
    if (customMessage) {
        DOM.answerRevealEl.innerHTML = customMessage; // dom.js
    } else {
        const leftData = currentLeftCardData; // gameState.js
        const rightData = currentRightCardData; // gameState.js
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
    showScreen('gameOver'); // ui.js
    enableGameButtons(false);

    // --- 리더보드 제출 로직은 완전히 제거 ---
    // 고급 설정 사용 시 안내문은 여전히 유용할 수 있으나, "리더보드에 등록할 수 없다"는 문구는 이제 불필요.
    // 필요하다면 "고급 설정을 사용한 플레이였습니다." 정도로 변경 가능.
    // 여기서는 해당 안내문 로직도 일단 제거. (필요시 다시 추가)
    /*
    const usingAdvancedOptions = (
        DOM.levelMinSelect.value !== "" || 
        DOM.levelMaxSelect.value !== "" || 
        DOM.hardModeCheckbox.checked ||
        DOM.easyModeCheckbox.checked
    );
    
    if (usingAdvancedOptions) {
        const noticeEl = document.createElement('p');
        noticeEl.id = 'advanced-option-notice';
        noticeEl.innerHTML = "<small><em>이지 모드 또는 다른 고급 설정을 사용한 플레이였습니다.</em></small>";
        noticeEl.style.color = "#f39c12";
        DOM.gameOverMessageEl.appendChild(noticeEl);
    }
    */
}

function enableGameButtons(enable) {
    DOM.upButton.disabled = !enable; // dom.js
    DOM.downButton.disabled = !enable; // dom.js
}