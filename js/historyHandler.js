// js/historyHandler.js
import { canvas } from './canvasSetup.js';
import { rerenderLayerList } from './layerEditor.js'; // 상태 복원 후 레이어 목록도 업데이트

const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

let history = []; // 캔버스 상태를 저장할 배열 (Undo 스택)
let historyIndex = -1; // 현재 상태를 가리키는 인덱스
const maxHistoryStates = 50; // 최대 저장할 상태 수 (메모리 관리)

let isRestoringState = false; // 상태 복원 중인지 나타내는 플래그 (무한 루프 방지)
let isVolatileState = false;  // 현재 중요하지 않은 작업(예: 다각형 그리기 중)이 진행 중인지

// 버튼 활성화/비활성화 업데이트
function updateHistoryButtons() {
    if (!undoButton || !redoButton) return;
    undoButton.disabled = historyIndex <= 0; // 첫 상태 이전으로는 Undo 불가
    redoButton.disabled = historyIndex >= history.length - 1; // 마지막 상태 이후로는 Redo 불가
}

export function setVolatileState(isVolatile) {
    isVolatileState = isVolatile;
    // console.log('Volatile state set to:', isVolatileState);
}

// 현재 캔버스 상태를 히스토리에 저장
export function saveCanvasState(forceSave = false) {
    if (isRestoringState) return; // 상태 복원 중에는 새 상태 저장 안 함

    if (isVolatileState && !forceSave) return;

    // 특정 작업은 너무 빈번하게 상태를 저장하지 않도록 조절 가능 (예: 객체 이동 중)
    // 하지만 여기서는 모든 object:modified 후에 저장하도록 main.js에서 호출 예정
    // forceSave는 연속적인 수정 중 마지막 상태만 저장하고 싶을 때 사용 가능 (지금은 단순화)

    const currentState = canvas.toJSON(['id', 'customName', 'selectable', 'visible', '_originalSelectable']); // 저장할 속성 지정
                                                                                                    // 필요한 사용자 정의 속성 추가

    // 현재 인덱스 이후의 히스토리(Redo 스택)는 제거 (새로운 작업 발생 시)
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }

    history.push(currentState);

    // 최대 히스토리 상태 수 제한
    if (history.length > maxHistoryStates) {
        history.shift(); // 가장 오래된 상태 제거
    } else {
        historyIndex++; // 새 상태가 추가되었으므로 인덱스 증가
    }
    
    // console.log('State saved. Index:', historyIndex, 'History length:', history.length);
    updateHistoryButtons();
}

// Undo 실행
function undo() {
    if (historyIndex <= 0) return; // 첫 상태 이전으로는 갈 수 없음

    isRestoringState = true; // 상태 복원 시작
    historyIndex--;
    const prevState = history[historyIndex];
    
    canvas.loadFromJSON(prevState, () => {
        canvas.renderAll();
        rerenderLayerList(); // 레이어 목록도 이전 상태로 (객체 ID 기준)
        isRestoringState = false; // 상태 복원 완료
        updateHistoryButtons();
        console.log('Undo to state:', historyIndex);
        // 복원 후 현재 선택된 객체가 있다면 해당 객체로 UI 업데이트 필요
        const activeObj = canvas.getActiveObject();
        if (activeObj && typeof updateTextToolUI !== 'undefined') { // main.js의 updateTextToolUI
            // updateTextToolUI(activeObj); // main.js에서 처리하도록 하거나 여기서 직접 호출
        }
        if (typeof updateSelectedLayerItem !== 'undefined' && activeObj) {
            // updateSelectedLayerItem(activeObj.id);
        }
    });
}

// Redo 실행
function redo() {
    if (historyIndex >= history.length - 1) return; // 마지막 상태 이후로는 갈 수 없음

    isRestoringState = true;
    historyIndex++;
    const nextState = history[historyIndex];

    canvas.loadFromJSON(nextState, () => {
        canvas.renderAll();
        rerenderLayerList();
        isRestoringState = false;
        updateHistoryButtons();
        console.log('Redo to state:', historyIndex);
        const activeObj = canvas.getActiveObject();
        if (activeObj && typeof updateTextToolUI !== 'undefined') {
            // updateTextToolUI(activeObj);
        }
         if (typeof updateSelectedLayerItem !== 'undefined' && activeObj) {
            // updateSelectedLayerItem(activeObj.id);
        }
    });
}


export function initializeHistoryHandler() {
    if (!undoButton || !redoButton) {
        console.warn("Undo/Redo buttons not found. History handler will not be fully initialized.");
        return;
    }

    // 초기 상태 저장
    // setTimeout을 사용하여 캔버스가 완전히 초기화된 후 첫 상태를 저장
    setTimeout(() => {
        saveCanvasState();
        // console.log('Initial state saved.');
    }, 100); // 딜레이는 상황에 따라 조절


    undoButton.addEventListener('click', undo);
    redoButton.addEventListener('click', redo);

    // 키보드 단축키 (Ctrl+Z, Ctrl+Y)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) { // Ctrl (Win/Linux) 또는 Cmd (Mac)
            if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault();
                if (!undoButton.disabled) undo();
            } else if (e.key === 'y' || e.key === 'Y') {
                e.preventDefault();
                if (!redoButton.disabled) redo();
            }
        }
    });

    updateHistoryButtons(); // 초기 버튼 상태 설정
}