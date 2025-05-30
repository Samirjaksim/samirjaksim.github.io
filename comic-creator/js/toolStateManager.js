// js/toolStateManager.js

const startPolygonLineButton = document.getElementById('start-polygon-line-button');
const finishPolygonLineButton = document.getElementById('finish-polygon-line-button');
const toggleDrawModeButton = document.getElementById('toggle-draw-mode-button');
const addRectFrameButton = document.getElementById('add-rect-frame-button');

let currentActiveDrawingTool = null;

export function setActiveDrawingTool(toolName) {
    currentActiveDrawingTool = toolName;
    updateAllToolButtonsState();
}

export function getActiveDrawingTool() {
    return currentActiveDrawingTool;
}

export function updateAllToolButtonsState() {
    // --- !!! 문제의 원인이 된 부분 수정 !!! ---
    // currentActiveDrawingTool 상태를 기반으로 boolean 플래그들 정의
    const isPolygonDrawing = (currentActiveDrawingTool === 'polygonLine');
    const isBrushDrawing = (currentActiveDrawingTool === 'brush');
    const isAnyDrawingToolActive = (currentActiveDrawingTool !== null);
    // --- !!! 수정 완료 !!! ---

    // 다각형 프레임 그리기 시작/완료 버튼 제어
    if (startPolygonLineButton) {
        startPolygonLineButton.disabled = isAnyDrawingToolActive && !isPolygonDrawing; // 다른 도구 활성화 시 비활성화
        startPolygonLineButton.style.display = isPolygonDrawing ? 'none' : 'inline-block'; // 다각형 그리기 중에는 시작 버튼 숨김
    }
    if (finishPolygonLineButton) {
        // 완료 버튼은 frameTool.js에서 display를 직접 제어하므로, 여기서는 disabled 상태만 관리하거나,
        // frameTool.js와 충돌하지 않도록 display 제어는 한 곳에서만 하는 것이 좋음.
        // 여기서는 frameTool.js가 display를 우선적으로 제어한다고 가정하고, disabled만 설정 (선택적)
        // 또는, display도 여기서 함께 제어하고 frameTool.js에서는 이 함수를 신뢰.
        // 현재 요청은 "버튼이 하나 더 생긴다" 였으므로 display 제어가 핵심.
        finishPolygonLineButton.style.display = isPolygonDrawing ? 'inline-block' : 'none'; // 다각형 그리기 중에만 완료 버튼 보임
    }

    // 브러시 그리기 모드 토글 버튼 제어
    if (toggleDrawModeButton) {
        toggleDrawModeButton.disabled = isAnyDrawingToolActive && !isBrushDrawing;

        // 브러시 모드가 아니거나, 다른 툴이 활성화되어 브러시 모드가 강제로 꺼져야 하는 경우 버튼 상태 초기화
        if (!isBrushDrawing) { // currentActiveDrawingTool이 'brush'가 아닌 모든 경우
            toggleDrawModeButton.textContent = '브러시 그리기';
            toggleDrawModeButton.classList.remove('active');
            // 만약 canvas.isDrawingMode가 true인데 currentActiveDrawingTool이 brush가 아니라면,
            // brushTool.js에서 isDrawingMode를 false로 바꿔주는 로직이 필요할 수 있음.
            // 여기서는 버튼 UI만 업데이트.
        } else { // currentActiveDrawingTool이 'brush'인 경우 (brushTool.js에서 이미 텍스트/클래스 변경했을 것임)
            // toggleDrawModeButton.textContent = '그리기 모드 끄기'; // brushTool.js에서 직접 관리
            // toggleDrawModeButton.classList.add('active');
        }
    }

    // 사각형 프레임 추가 버튼 (즉시 완료되는 작업)
    if (addRectFrameButton) {
        addRectFrameButton.disabled = isAnyDrawingToolActive;
    }
}

// (main.js에서 DOMContentLoaded 후 updateAllToolButtonsState() 호출)