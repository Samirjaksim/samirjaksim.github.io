// js/eraserTool.js
import { canvas } from './canvasSetup.js';

const toggleEraserButton = document.getElementById('toggle-eraser-button');
const eraserWidthInput = document.getElementById('eraser-width-input');
const eraserWidthValue = document.getElementById('eraser-width-value');

let originalBrush = null; // 지우개 모드 이전 브러시 저장용
let originalCursor = canvas.defaultCursor; // 원래 커서 저장

export function initializeEraserTool() {
    if (!toggleEraserButton || !eraserWidthInput || !eraserWidthValue) {
        console.warn("Eraser tool UI elements not found. Eraser tool will not be initialized.");
        return;
    }

    // Fabric.js 5.x 버전부터 사용 가능한 EraserBrush 확인
    if (typeof fabric.EraserBrush === 'undefined') {
        console.error("fabric.EraserBrush is not available. Please use Fabric.js v5.x or higher for this feature, or implement a custom eraser.");
        toggleEraserButton.disabled = true;
        eraserWidthInput.disabled = true;
        return;
    }

    // 초기 브러시 설정 (지우개 브러시 인스턴스 미리 생성)
    const eraserBrush = new fabric.EraserBrush(canvas);
    eraserBrush.width = parseInt(eraserWidthInput.value, 10);
    // eraserBrush.color = 'rgba(0,0,0,1)'; // EraserBrush는 색상이 의미 없음 (투명으로 만듦)
    // eraserBrush.shadow = null; // 지우개에는 그림자 불필요

    toggleEraserButton.addEventListener('click', () => {
        canvas.isDrawingMode = !canvas.isDrawingMode;

        if (canvas.isDrawingMode) {
            originalBrush = canvas.freeDrawingBrush; // 현재 브러시 저장 (만약 있다면)
            canvas.freeDrawingBrush = eraserBrush;
            canvas.freeDrawingBrush.width = parseInt(eraserWidthInput.value, 10);
            toggleEraserButton.textContent = '지우개 모드 끄기';
            toggleEraserButton.classList.add('active'); // 활성 상태 CSS 클래스 (선택)
            canvas.defaultCursor = 'crosshair'; // 또는 커스텀 지우개 커서
            canvas.hoverCursor = 'crosshair';
            // 다른 도구 비활성화 로직 (선택 사항)
            // textToolsContainer.classList.add('disabled');
            // frameToolsContainer.classList.add('disabled');
            console.log('Eraser mode ON');
        } else {
            canvas.freeDrawingBrush = originalBrush || new fabric.PencilBrush(canvas); // 이전 브러시로 복원 또는 기본 브러시
            toggleEraserButton.textContent = '지우개 모드 켜기';
            toggleEraserButton.classList.remove('active');
            canvas.defaultCursor = originalCursor;
            canvas.hoverCursor = originalCursor;
            // 다른 도구 활성화 로직
            console.log('Eraser mode OFF');
        }
        canvas.renderAll(); // 커서 변경 등을 즉시 반영
    });

    eraserWidthInput.addEventListener('input', (event) => {
        const newWidth = parseInt(event.target.value, 10);
        eraserWidthValue.textContent = newWidth;
        if (canvas.isDrawingMode && canvas.freeDrawingBrush === eraserBrush) {
            canvas.freeDrawingBrush.width = newWidth;
        } else if (eraserBrush) { // 지우개 모드가 아니더라도, 미리 생성된 eraserBrush의 너비는 업데이트
            eraserBrush.width = newWidth;
        }
    });
}