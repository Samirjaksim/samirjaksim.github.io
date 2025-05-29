// js/brushTool.js
import { canvas } from './canvasSetup.js';

const toggleDrawModeButton = document.getElementById('toggle-draw-mode-button');
const brushTypeSelect = document.getElementById('brush-type-select');
const brushColorInput = document.getElementById('brush-color-input');
const brushWidthInput = document.getElementById('brush-width-input');
const brushWidthValue = document.getElementById('brush-width-value');

// (선택 사항) 그림자 UI 요소
// const brushShadowColorInput = document.getElementById('brush-shadow-color-input');
// const brushShadowWidthInput = document.getElementById('brush-shadow-width-input');
// const brushShadowWidthValue = document.getElementById('brush-shadow-width-value');
// const brushShadowOffsetInput = document.getElementById('brush-shadow-offset-input');
// const brushShadowOffsetValue = document.getElementById('brush-shadow-offset-value');

let originalCursor = canvas.defaultCursor; // 원래 커서 저장
let originalHoverCursor = canvas.hoverCursor;

function updateBrushProperties() {
    if (!canvas.isDrawingMode || !canvas.freeDrawingBrush) return;

    canvas.freeDrawingBrush.color = brushColorInput.value;
    canvas.freeDrawingBrush.width = parseInt(brushWidthInput.value, 10);

    // (선택 사항) 그림자 설정
    // const shadowWidth = parseInt(brushShadowWidthInput.value, 10);
    // if (shadowWidth > 0) {
    //     canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    //         blur: shadowWidth,
    //         offsetX: parseInt(brushShadowOffsetInput.value, 10),
    //         offsetY: parseInt(brushShadowOffsetInput.value, 10), // 예시로 X, Y 동일하게
    //         affectStroke: true,
    //         color: brushShadowColorInput.value,
    //     });
    // } else {
    //     canvas.freeDrawingBrush.shadow = null; // 그림자 없음
    // }
}

function setBrushType() {
    if (!canvas.isDrawingMode) return; // 그리기 모드가 아닐 때는 브러시 변경 안 함

    const brushType = brushTypeSelect.value;
    if (brushType === 'PencilBrush' && fabric.PencilBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    } else if (brushType === 'CircleBrush' && fabric.CircleBrush) {
        canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
    } else if (brushType === 'SprayBrush' && fabric.SprayBrush) {
        canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
    } else {
        console.warn(`Unsupported brush type or brush not available: ${brushType}`);
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas); // 기본값
    }
    updateBrushProperties(); // 새 브러시에 현재 설정된 속성 적용
}


export function initializeBrushTool() {
    if (!toggleDrawModeButton || !brushTypeSelect || !brushColorInput || !brushWidthInput || !brushWidthValue) {
        console.warn("Brush tool UI elements not found. Brush tool will not be initialized.");
        return;
    }

    toggleDrawModeButton.addEventListener('click', () => {
        canvas.isDrawingMode = !canvas.isDrawingMode;

        if (canvas.isDrawingMode) {
            setBrushType(); // 브러시 타입 설정 및 속성 적용
            toggleDrawModeButton.textContent = '그리기 모드 끄기';
            toggleDrawModeButton.classList.add('active');
            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            // 다른 객체 선택 비활성화 (캔버스 자체를 드로잉 모드로 사용)
            canvas.selection = false;
            canvas.getObjects().forEach(obj => obj.set('selectable', false));
            console.log('Drawing mode ON');
        } else {
            toggleDrawModeButton.textContent = '그리기 모드 켜기';
            toggleDrawModeButton.classList.remove('active');
            canvas.defaultCursor = originalCursor;
            canvas.hoverCursor = originalHoverCursor;
            // 객체 선택 다시 활성화
            canvas.selection = true;
            canvas.getObjects().forEach(obj => {
                // 잠금 상태가 아닌 객체들만 다시 selectable true로
                if (obj.hasOwnProperty('_customSelectableState') ? obj._customSelectableState : true) {
                    obj.set('selectable', true);
                }
            });

            console.log('Drawing mode OFF');
        }
        canvas.renderAll();
    });

    brushTypeSelect.addEventListener('change', () => {
        if (canvas.isDrawingMode) {
            setBrushType();
        }
    });

    brushColorInput.addEventListener('input', () => {
        if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = brushColorInput.value;
        }
    });

    brushWidthInput.addEventListener('input', (event) => {
        const newWidth = parseInt(event.target.value, 10);
        brushWidthValue.textContent = newWidth;
        if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = newWidth;
        }
    });

    // (선택 사항) 그림자 UI 이벤트 리스너
    // if (brushShadowColorInput && brushShadowWidthInput && brushShadowOffsetInput) {
    //     brushShadowColorInput.addEventListener('input', updateBrushProperties);
    //     brushShadowWidthInput.addEventListener('input', (e) => {
    //         brushShadowWidthValue.textContent = e.target.value;
    //         updateBrushProperties();
    //     });
    //     brushShadowOffsetInput.addEventListener('input', (e) => {
    //         brushShadowOffsetValue.textContent = e.target.value;
    //         updateBrushProperties();
    //     });
    // }
}