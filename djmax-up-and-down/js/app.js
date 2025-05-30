function populateLevelSelects() {
    const minSelect = DOM.levelMinSelect;
    const maxSelect = DOM.levelMaxSelect;

    if (!minSelect || !maxSelect) return; // 요소가 없으면 중단

    // 기존 "전체" 옵션 외의 옵션들 제거 (재실행 시 중복 방지)
    // minSelect.innerHTML = '<option value="">전체</option>';
    // maxSelect.innerHTML = '<option value="">전체</option>';
    // 위 방식 대신, 첫 번째 옵션(전체)만 남기고 나머지를 지우는 것이 더 안전할 수 있습니다.
    // 여기서는 간단하게, 이미 HTML에 "전체"가 있으므로 추가만 합니다.
    // 만약 이 함수가 여러 번 호출될 가능성이 있다면, 옵션 초기화 로직이 필요합니다.

    for (let i = 1; i <= 15; i++) {
        const optionMin = document.createElement('option');
        optionMin.value = i;
        optionMin.textContent = i;
        minSelect.appendChild(optionMin);

        const optionMax = document.createElement('option');
        optionMax.value = i;
        optionMax.textContent = i;
        maxSelect.appendChild(optionMax);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateLevelSelects();
    
    // 모드 선택 버튼 이벤트 리스너
    DOM.modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedButtonMode = button.dataset.mode; // game.js의 selectedButtonMode
            if (filterDataByMode()) { // data.js
                startGame(); // game.js
            }
        });
    });

    // Up/Down 버튼 이벤트 리스너
    if (DOM.upButton && DOM.downButton) {
        DOM.upButton.addEventListener('click', () => handleGuess(true)); // game.js
        DOM.downButton.addEventListener('click', () => handleGuess(false)); // game.js
    } else {
        console.error("Up/Down buttons not found in the DOM.");
    }
    
    // 다시 하기 버튼 이벤트 리스너
    DOM.restartButton.addEventListener('click', () => {
        showScreen('modeSelection'); // ui.js
    });

    // 고급 설정 펼치기/접기 버튼 이벤트 리스너
    if (DOM.toggleAdvancedSettingsButton && DOM.advancedSettingsContent) {
        DOM.toggleAdvancedSettingsButton.addEventListener('click', () => {
            const isHidden = DOM.advancedSettingsContent.classList.toggle('hidden');
            DOM.toggleAdvancedSettingsButton.textContent = isHidden ? '고급 설정 펼치기' : '고급 설정 접기';
        });
    }

    // 애플리케이션 시작: 데이터 가져오기
    fetchData(); // data.js
});