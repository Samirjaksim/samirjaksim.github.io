// js/gameLogic.js

function getRandomProblem(dataPool, excludeCardData, excludeFloorValue, excludePlayedIds) {
    if (!dataPool || dataPool.length === 0) return null;

    let candidatePool = [...dataPool];

    // 0. 이미 출제된 문제 제외
    if (excludePlayedIds && excludePlayedIds.length > 0) {
        candidatePool = candidatePool.filter(item => !excludePlayedIds.includes(item.id));
    }

    // 1. 기본 필터링
    if (excludeCardData) { 
        candidatePool = candidatePool.filter(item => {
            if (item.id === excludeCardData.id) return false;
            if (item.name === excludeCardData.name && item.buttonMode === excludeCardData.buttonMode) {
                return false;
            }
            if (excludeFloorValue !== null && typeof excludeFloorValue === 'number' && item.floor === excludeFloorValue) {
                return false;
            }
            return true;
        });
    } else if (excludeFloorValue !== null && typeof excludeFloorValue === 'number') {
         candidatePool = candidatePool.filter(item => item.floor !== excludeFloorValue);
    }

    // 2. 하드 모드 필터링 (DOM.hardModeCheckbox는 dom.js, HARD_MODE_DIFFERENCE는 constants.js 참조)
    if (DOM.hardModeCheckbox.checked && excludeFloorValue !== null && typeof excludeFloorValue === 'number' && candidatePool.length > 0) {
        const hardModeFilteredPool = candidatePool.filter(item => {
            const floorDiff = Math.abs(item.floor - excludeFloorValue);
            return floorDiff <= HARD_MODE_DIFFERENCE && floorDiff > 0.001; 
        });
        if (hardModeFilteredPool.length > 0) {
            candidatePool = hardModeFilteredPool;
        } else {
            console.warn(`Hard mode: No patterns found within ±${HARD_MODE_DIFFERENCE} of ${excludeFloorValue}. Using general pool.`);
        }
    }
    
    // 3. 최종 후보군이 없으면 규칙 완화 시도
    if (candidatePool.length === 0) {
        candidatePool = dataPool.filter(item => {
            if (excludePlayedIds && excludePlayedIds.includes(item.id)) return false;
            if (excludeCardData && item.id === excludeCardData.id) return false;
            if (excludeFloorValue !== null && typeof excludeFloorValue === 'number' && item.floor === excludeFloorValue) return false;
            // "같은 곡, 같은 버튼 모드" 규칙은 완화 단계에서 기본적으로 제외 (필요시 아래 주석 해제)
            /*
            if (excludeCardData && item.name === excludeCardData.name && item.buttonMode === excludeCardData.buttonMode) {
                 return false;
            }
            */
            return true;
        });
        if (candidatePool.length === 0) {
             return null; 
        }
    }
    
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[randomIndex];
}