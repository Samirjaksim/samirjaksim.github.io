// 이 파일에서 사용할 전역 변수 (다른 파일에서도 접근 가능)
let allSongsRawData = [];
let fullGameReadyData = [];
let currentGamePlayableData = [];

async function fetchData() {
    try {
        showScreen('loading'); // ui.js의 함수 사용
        const response = await fetch(API_URL); // constants.js의 상수 사용
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
        allSongsRawData = await response.json();
        
        prepareFullGameData();
        
        if (fullGameReadyData.length < 2) {
            DOM.errorMessageEl.innerHTML = '게임에 필요한 데이터(Floor 값 있는 패턴)가 2개 미만입니다. 게임을 시작할 수 없습니다.';
            showScreen('error');
            return;
        }
        showScreen('modeSelection');
    } catch (error) {
        console.error("Error fetching or processing data:", error);
        DOM.errorMessageEl.textContent = `데이터를 불러오는 데 실패했습니다: ${error.message}. 잠시 후 다시 시도해주세요.`;
        showScreen('error');
    }
}

function prepareFullGameData() {
    fullGameReadyData = [];
    allSongsRawData.forEach(song => {
        if (!song.patterns) return;
        Object.keys(song.patterns).forEach(buttonMode => {
            Object.keys(song.patterns[buttonMode]).forEach(patternType => {
                const patternData = song.patterns[buttonMode][patternType];
                if (patternData && patternData.hasOwnProperty('floor') && patternData.floor !== null && typeof patternData.floor !== 'undefined') {
                    fullGameReadyData.push({
                        id: `${song.name}-${buttonMode}-${patternType}`,
                        titleId: song.title,
                        name: song.name,
                        composer: song.composer,
                        dlc: song.dlc,
                        buttonMode: buttonMode,
                        patternType: patternType, // 패턴 타입 (NM, HD, SC 등) 저장
                        level: patternData.level,
                        floor: parseFloat(patternData.floor) 
                    });
                }
            });
        });
    });
}

function filterDataByMode() {
    let baseFilteredData;
    if (selectedButtonMode === 'ALL') {
        baseFilteredData = [...fullGameReadyData];
    } else {
        baseFilteredData = fullGameReadyData.filter(pattern => pattern.buttonMode === selectedButtonMode);
    }

    let scFilteredData;
    if (DOM.scOnlyCheckbox.checked) {
        scFilteredData = baseFilteredData.filter(pattern => pattern.patternType === 'SC');
    } else {
        scFilteredData = baseFilteredData;
    }

    // 난이도 범위 필터링 (사용자는 Level 선택, 실제 필터링은 Floor 기준)
    const minLevelStr = DOM.levelMinSelect.value;
    const maxLevelStr = DOM.levelMaxSelect.value;
    let levelRangeFilteredData = scFilteredData;

    // 사용자가 선택한 정수 레벨을 floor 범위로 변환
    // "전체" 선택 시, floor 값 제한 없음 (매우 작은 값 / 매우 큰 값으로 설정)
    const selectedMinLevelInt = (minLevelStr === "") ? -Infinity : parseInt(minLevelStr);
    const selectedMaxLevelInt = (maxLevelStr === "") ? Infinity : parseInt(maxLevelStr);

    // 유효성 검사: 최소 정수 레벨이 최대 정수 레벨보다 큰 경우
    if (selectedMinLevelInt > selectedMaxLevelInt) {
        DOM.errorMessageEl.innerHTML = "난이도 범위 설정 오류: 최소 레벨이 최대 레벨보다 클 수 없습니다.";
        showScreen('error');
        setTimeout(() => { if (!DOM.errorMessageEl.classList.contains('hidden')) showScreen('modeSelection'); }, 3000);
        return false;
    }
    
    // 실제 필터링: floor 값 기준
    // "전체"가 아닐 때만 필터링 조건 추가
    if (minLevelStr !== "" || maxLevelStr !== "") {
        levelRangeFilteredData = scFilteredData.filter(pattern => {
            const floor = pattern.floor;
            // 최소: 선택한 정수 레벨 이상 (예: 10 선택 시 floor >= 10.0)
            // 최대: 선택한 정수 레벨 + 1 미만 (예: 12 선택 시 floor < 13.0)
            const meetsMinCondition = (minLevelStr === "") ? true : floor >= selectedMinLevelInt;
            const meetsMaxCondition = (maxLevelStr === "") ? true : floor < (selectedMaxLevelInt + 1); 
            
            return meetsMinCondition && meetsMaxCondition;
        });
    }
    
    currentGamePlayableData = levelRangeFilteredData;
    
    // 데이터 개수 체크
    if (currentGamePlayableData.length < 2) {
        let modeText = selectedButtonMode === 'ALL' ? '모든 모드' : selectedButtonMode;
        let scText = DOM.scOnlyCheckbox.checked ? " SC 패턴" : "";
        
        let levelText = ""; // 표시되는 텍스트는 사용자가 선택한 정수 레벨 기준
        if (minLevelStr !== "" && maxLevelStr !== "") levelText = ` (Lv ${minLevelStr}~${maxLevelStr})`;
        else if (minLevelStr !== "") levelText = ` (Lv ${minLevelStr}~ )`;
        else if (maxLevelStr !== "") levelText = ` (Lv ~${maxLevelStr})`;
        
        DOM.errorMessageEl.innerHTML = `선택하신 조건(${modeText}${scText}${levelText})에는<br>게임을 진행할 수 있는 패턴이 2개 미만입니다. 다른 옵션을 선택해주세요.`;
        showScreen('error');
        setTimeout(() => { if (!DOM.errorMessageEl.classList.contains('hidden')) showScreen('modeSelection'); }, 3500);
        return false;
    }
    return true;
}