const DOM = {
    scoreEl: document.getElementById('score'),
    leftCardEl: document.getElementById('left-card'),
    rightCardEl: document.getElementById('right-card'),
    upButton: document.getElementById('up-button'),
    downButton: document.getElementById('down-button'),
    gameOverMessageEl: document.getElementById('game-over-message'),
    finalScoreEl: document.getElementById('final-score'),
    restartButton: document.getElementById('restart-button'),
    loadingMessageEl: document.getElementById('loading-message'),
    errorMessageEl: document.getElementById('error-message'),
    modeSelectionScreen: document.getElementById('mode-selection'),
    scoreBoardScreen: document.getElementById('score-board'),
    gameAreaScreen: document.getElementById('game-area'),
    controlsScreen: document.getElementById('controls'),
    modeButtons: document.querySelectorAll('.mode-button'),
    answerRevealEl: document.getElementById('answer-reveal'),
    scOnlyCheckbox: document.getElementById('sc-only-checkbox'),
    currentModeDisplay: document.getElementById('current-mode-display'), // 현재 모드 표시 영역
    currentModeText: document.getElementById('current-mode-text'),     // 현재 모드 텍스트 영역
    toggleAdvancedSettingsButton: document.getElementById('toggle-advanced-settings'),
    advancedSettingsContent: document.getElementById('advanced-settings-content'),
    levelMinSelect: document.getElementById('level-min-select'),
    levelMaxSelect: document.getElementById('level-max-select'),
    hardModeCheckbox: document.getElementById('hard-mode-checkbox')
};