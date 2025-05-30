// js/brushTool.js
import { canvas } from './canvasSetup.js';
import { addLayerItem, rerenderLayerList, updateSelectedLayerItem } from './layerEditor.js';
// toolStateManager.js에서 함수들을 import
import { setActiveDrawingTool, getActiveDrawingTool } from './toolStateManager.js';

const toggleDrawModeButton = document.getElementById('toggle-draw-mode-button');
const brushTypeSelect = document.getElementById('brush-type-select');
const brushColorInput = document.getElementById('brush-color-input');
const brushWidthInput = document.getElementById('brush-width-input');
const brushWidthValue = document.getElementById('brush-width-value');
const brushCursorPreview = document.getElementById('brush-cursor-preview');

let currentDrawingGroup = null; // 현재 그리기 세션의 Path들을 담을 그룹
let originalCanvasCursor, originalCanvasHoverCursor; // 캔버스 원래 커서 상태
let isBrushToolInitialized = false; // 모듈 초기화 플래그

// 가짜 브러시 커서 업데이트 함수
function updateBrushCursorPreview(show, pointer, width) {
    if (!brushCursorPreview) return;
    if (show && canvas.isDrawingMode) { // 그리기 모드일 때만 가짜 커서 표시
        brushCursorPreview.classList.remove('brush-cursor-preview-hidden');
        const canvasEl = canvas.getElement();
        const effectivePointer = pointer || canvas.getPointer();

        if (effectivePointer) {
            const x = canvasEl.offsetLeft + effectivePointer.x;
            const y = canvasEl.offsetTop + effectivePointer.y;
            brushCursorPreview.style.left = `${x}px`;
            brushCursorPreview.style.top = `${y}px`;
        }
        brushCursorPreview.style.width = `${width}px`;
        brushCursorPreview.style.height = `${width}px`;
    } else {
        brushCursorPreview.classList.add('brush-cursor-preview-hidden');
    }
}

// 현재 UI 설정값을 캔버스의 freeDrawingBrush에 적용하는 함수
function applyCurrentBrushPropertiesToCanvas() {
    if (!canvas.isDrawingMode || !canvas.freeDrawingBrush) return;

    const currentWidth = parseInt(brushWidthInput.value, 10);
    canvas.freeDrawingBrush.color = brushColorInput.value;
    canvas.freeDrawingBrush.width = currentWidth;
    // (선택 사항) 그림자 설정 로직
    updateBrushCursorPreview(true, null, currentWidth);
}

// 선택된 브러시 타입으로 캔버스의 freeDrawingBrush를 설정하는 함수
function changeCanvasBrushType() {
    if (!canvas.isDrawingMode) return; // 그리기 모드가 아닐 때는 브러시 변경 안 함

    const brushType = brushTypeSelect.value;
    let newBrush;

    if (brushType === 'PencilBrush' && fabric.PencilBrush) {
        newBrush = new fabric.PencilBrush(canvas);
    } else if (brushType === 'CircleBrush' && fabric.CircleBrush) {
        newBrush = new fabric.CircleBrush(canvas);
    } else if (brushType === 'SprayBrush' && fabric.SprayBrush) {
        newBrush = new fabric.SprayBrush(canvas);
    } else {
        console.warn(`Unsupported brush type: ${brushType}. Defaulting to PencilBrush.`);
        newBrush = new fabric.PencilBrush(canvas);
    }
    canvas.freeDrawingBrush = newBrush;
    applyCurrentBrushPropertiesToCanvas(); // 새 브러시에 현재 UI 속성 적용
}

export function initializeBrushTool() {
    if (isBrushToolInitialized) return;

    if (!toggleDrawModeButton || !brushTypeSelect || !brushColorInput || !brushWidthInput || !brushWidthValue) {
        console.warn("Brush tool UI elements not fully found. Brush tool may not work as expected.");
        if(toggleDrawModeButton) toggleDrawModeButton.disabled = true;
        return;
    }
    if (typeof fabric.PencilBrush === 'undefined') {
        console.error("fabric.PencilBrush is not available.");
        if(toggleDrawModeButton) toggleDrawModeButton.disabled = true;
        return;
    }

    originalCanvasCursor = canvas.defaultCursor;
    originalCanvasHoverCursor = canvas.hoverCursor;

    const initialBrushWidth = parseInt(brushWidthInput.value, 10);
    const initialBrushColor = brushColorInput.value;

    toggleDrawModeButton.addEventListener('click', () => {
        const isCurrentlyDrawing = canvas.isDrawingMode; // 현재 상태
        const newDrawingModeState = !isCurrentlyDrawing;  // 목표 상태

        if (newDrawingModeState) { // 그리기 모드를 켜려고 할 때
            // 다른 그리기 도구가 활성화되어 있다면, 브러시 모드를 켤 수 없음
            if (getActiveDrawingTool() !== null && getActiveDrawingTool() !== 'brush') {
                alert("다른 그리기 작업을 먼저 완료해주세요.");
                return;
            }
            canvas.isDrawingMode = true;
            setActiveDrawingTool('brush'); // 전역 상태를 'brush'로 설정

            canvas.getElement().classList.add('drawing-mode-active');
            changeCanvasBrushType(); // 브러시 타입 설정 및 속성 적용 (내부에서 applyCurrentBrushPropertiesToCanvas 호출)
            toggleDrawModeButton.textContent = '브러시 그리기 완료';
            toggleDrawModeButton.classList.add('active');
            canvas.selection = false; // 객체 선택 비활성화
            canvas.getObjects().forEach(obj => {
                obj._originalSelectable = obj.selectable;
                obj.set('selectable', false);
            });
            updateBrushCursorPreview(true, null, parseInt(brushWidthInput.value, 10));

            currentDrawingGroup = new fabric.Group([], { left: 0, top: 0 });
            console.log('Drawing mode ON - Brush tool active');

        } else { // 그리기 모드를 끄려고 할 때 (newDrawingModeState is false)
            canvas.isDrawingMode = false;
            setActiveDrawingTool(null); // 전역 그리기 도구 상태 해제

            canvas.getElement().classList.remove('drawing-mode-active');
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas); // 기본 브러시로 리셋
            canvas.freeDrawingBrush.width = initialBrushWidth;
            canvas.freeDrawingBrush.color = initialBrushColor;
            canvas.defaultCursor = originalCanvasCursor;
            canvas.hoverCursor = originalCanvasHoverCursor;
            toggleDrawModeButton.textContent = '브러시 그리기';
            toggleDrawModeButton.classList.remove('active');
            canvas.selection = true;
            canvas.getObjects().forEach(obj => {
                obj.set('selectable', obj.hasOwnProperty('_originalSelectable') ? obj._originalSelectable : true);
                delete obj._originalSelectable;
            });
            updateBrushCursorPreview(false, null, 0);

            if (currentDrawingGroup && currentDrawingGroup.size() > 0) {
                if (!canvas.getObjects().includes(currentDrawingGroup)){
                     // 일반적으로 path:created에서 그룹이 추가되지만, 만약을 위한 방어코드
                     // canvas.add(currentDrawingGroup);
                }
                if (!currentDrawingGroup.id) {
                     currentDrawingGroup.id = 'drawing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }
                currentDrawingGroup.customName = currentDrawingGroup.customName || '그림';
                currentDrawingGroup.setCoords();
                
                addLayerItem(currentDrawingGroup);
                rerenderLayerList(); // 그리기 완료 후 레이어 목록 전체 업데이트
                updateSelectedLayerItem(currentDrawingGroup.id);
                canvas.setActiveObject(currentDrawingGroup);
                console.log('Drawing mode OFF - Drawing group finalized:', currentDrawingGroup.id);
            } else if (currentDrawingGroup) {
                if(canvas.getObjects().includes(currentDrawingGroup)) canvas.remove(currentDrawingGroup);
                console.log('Drawing mode OFF - Empty drawing group discarded.');
            }
            currentDrawingGroup = null;
        }
        canvas.renderAll();
    });

    brushTypeSelect.addEventListener('change', () => {
        if (canvas.isDrawingMode) { // 그리기 모드일 때만 브러시 타입 변경
            changeCanvasBrushType();
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
        // 그리기 모드 중이 아니더라도, 마우스가 캔버스 위에 있고 가짜 커서가 보인다면 크기 업데이트
        if (canvas.isDrawingMode && brushCursorPreview && !brushCursorPreview.classList.contains('brush-cursor-preview-hidden')) {
             updateBrushCursorPreview(true, null, newWidth);
        }
    });

    // --- 캔버스 이벤트 핸들러 (브러시 도구 자체에서 필요한 것들) ---
    canvas.on('path:created', function brushPathCreatedHandler(e) {
        if (e.path && canvas.isDrawingMode && currentDrawingGroup) {
            canvas.remove(e.path); // 캔버스에 자동 추가된 path 제거
            currentDrawingGroup.addWithUpdate(e.path); // 현재 드로잉 그룹에 추가

            if (!canvas.getObjects().includes(currentDrawingGroup)) {
                canvas.add(currentDrawingGroup); // 그룹이 캔버스에 없으면 추가
            }
            currentDrawingGroup.setCoords(); // 그룹 좌표/크기 업데이트
            canvas.renderAll();
        }
    });
    
    // 가짜 커서 위치 및 표시/숨김 처리
    canvas.on('mouse:move', function brushToolMouseMove(options) {
        if (canvas.isDrawingMode) {
            updateBrushCursorPreview(true, options.pointer, parseInt(brushWidthInput.value, 10));
        }
    });
    canvas.getElement().addEventListener('mouseenter', function brushToolCanvasEnter(event) {
        if (canvas.isDrawingMode) {
            const pointer = canvas.getPointer(event);
            updateBrushCursorPreview(true, pointer, parseInt(brushWidthInput.value, 10));
        }
    });
    canvas.getElement().addEventListener('mouseleave', function brushToolCanvasLeave() {
        if (canvas.isDrawingMode) {
            updateBrushCursorPreview(false, null, 0);
        }
    });
    
    isBrushToolInitialized = true;
}