// js/main.js
import { debounce } from './utils.js'; // 직접 만든 debounce 함수 import
import { canvas } from './canvasSetup.js';
import { initializeCanvasControls } from './canvasControls.js';
import { initializeImageHandling } from './imageHandler.js';
import { initializeTextTool, updateTextToolUI } from './textTool.js';
import { initializeLineTool } from './lineTool.js';
import { initializeObjectControls } from './objectControls.js';
import { initializeBrushTool } from './brushTool.js';
import { initializeHistoryHandler, saveCanvasState } from './historyHandler.js'; // saveCanvasState import
import { addLayerItem, removeLayerItem, updateSelectedLayerItem, rerenderLayerList } from './layerEditor.js';
import { updateAllToolButtonsState } from './toolStateManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 각 기능 모듈 초기화
    initializeImageHandling();
    initializeTextTool();
    initializeLineTool();
    initializeObjectControls();
    initializeBrushTool();
    initializeHistoryHandler(); // Undo/Redo 초기화 (내부에서 초기 상태 저장)
    updateAllToolButtonsState();
    initializeCanvasControls();

    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModalButton = document.getElementById('close-help-modal');

     if (helpButton && helpModal && closeHelpModalButton) {
        helpButton.addEventListener('click', () => {
            helpModal.style.display = 'block'; // 모달 보이기
        });

        closeHelpModalButton.addEventListener('click', () => {
            helpModal.style.display = 'none'; // 모달 숨기기
        });

        // 모달 외부 클릭 시 닫기 (선택 사항)
        window.addEventListener('click', (event) => {
            if (event.target === helpModal) { // 클릭된 대상이 모달 배경 자체일 때
                helpModal.style.display = 'none';
            }
        });

        // ESC 키로 모달 닫기 (선택 사항)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && helpModal.style.display === 'block') {
                helpModal.style.display = 'none';
            }
        });

    } else {
        console.warn("Help modal elements not found. Help feature may not work.");
    }

    // --- 캔버스 변경을 감지하고 상태를 저장하기 위한 디바운스 함수 ---
    // object:modified 와 같이 매우 빈번하게 발생할 수 있는 이벤트에 사용
    const debouncedSaveState = debounce(function() { // 직접 만든 debounce 사용
        // console.log('Debounced save state triggered (custom debounce)');
        saveCanvasState();
    }, 300);

    // 캔버스 전역 이벤트 핸들러
    canvas.on({
        'object:added': (e) => {
            if (e.target) {

                if (e.target.isTemporary) {
                    // console.log('Temporary object added, not adding to layer list:', e.target);
                    // 임시 객체 추가는 히스토리에도 저장하지 않음 (saveCanvasState 호출 안 함)
                    return; // 여기서 함수 종료
                }

                // brushTool.js에서 그리기 완료 시 그룹 객체에 대한 addLayerItem 및
                // rerenderLayerList, updateSelectedLayerItem, setActiveObject 등을 이미 처리할 수 있음.
                // 따라서, e.target이 brushTool에서 온 drawing group이 아닌 경우에만 아래 로직을 타도록 하거나,
                // brushTool에서 object:added 이벤트를 발생시키지 않도록 조정 필요.
                // 여기서는 모든 추가된 객체에 대해 일단 addLayerItem을 호출한다고 가정.
                // (중복 추가 방지 로직은 addLayerItem 내부에 있거나, 여기서 ID 체크 필요)
                
                // 임시 드로잉 그룹은 레이어 목록에 바로 추가하지 않음
                // (brushTool.js에서 그리기 완료 시 최종 그룹을 addLayerItem으로 추가)
                if (!(e.target.isType('group') && e.target._objects && e.target._isDrawingGroup)) { // _isDrawingGroup 같은 플래그 사용 가정
                    addLayerItem(e.target);
                    if (e.target) canvas.setActiveObject(e.target); // 새로 추가된 일반 객체 활성화
                }
            }
            rerenderLayerList(); // 객체 추가 후 레이어 목록 순서 동기화
            saveCanvasState();   // 객체 추가는 명확한 변경이므로 (디바운스 없이) 즉시 저장
        },
        'object:removed': (e) => {
            if (e.target && e.target.isTemporary) {
                // console.log('Temporary object removed:', e.target);
                return; // 여기서 함수 종료
            }
            if (e.target && e.target.id) {
                removeLayerItem(e.target.id);
            }
            rerenderLayerList();
            if (canvas.getObjects().length === 0) {
                document.getElementById('layer-list').innerHTML = '';
            }
            saveCanvasState();   // 객체 제거도 즉시 저장
        },
        'object:modified': (e) => { // 객체 이동, 크기조절, 회전, 속성 변경 등 완료 후
            if (e.target && e.target.isTemporary) {
                return; // 임시 객체 수정은 히스토리에 저장 안 함
            }
            if (e.target && (e.target.isType('i-text') || e.target.isType('textbox'))) {
                updateTextToolUI(e.target);
            }
            // object:modified는 드래그 중에도 계속 발생하므로 디바운스 처리
            debouncedSaveState();
        },
        'text:editing:exited': (e) => { // 텍스트 객체 내용 편집 완료
            const activeObject = canvas.getActiveObject();
            if (activeObject === e.target) {
                updateTextToolUI(activeObject);
                updateSelectedLayerItem(activeObject.id);
            }
            saveCanvasState(); // 텍스트 편집 완료는 명확한 변경이므로 즉시 저장
        },
        // `path:created` 이벤트는 brushTool.js에서 처리하고,
        // 그리기 완료 시 `currentDrawingGroup`에 대해 `object:added`가 발생하여 여기서 처리됨.

        // --- 선택 관련 UI 업데이트 핸들러 (상태 저장 X) ---
        'selection:created': (e) => {
            const selectedObject = (e.selected && e.selected.length === 1) ? e.selected[0] : canvas.getActiveObject();
            if (selectedObject) {
                updateTextToolUI(selectedObject);
                updateSelectedLayerItem(selectedObject.id);
            }
        },
        'selection:updated': (e) => {
            const activeObject = canvas.getActiveObject();
            updateTextToolUI(activeObject);
            if (canvas.getActiveObjects().length > 1) {
                updateSelectedLayerItem(null);
            } else if (activeObject) {
                updateSelectedLayerItem(activeObject.id);
            } else {
                updateSelectedLayerItem(null);
            }
        },
        'selection:cleared': () => {
            updateTextToolUI(null);
            updateSelectedLayerItem(null);
        },
        'text:editing:entered': (e) => {
            updateTextToolUI(e.target);
            if (e.target && e.target.id) {
                updateSelectedLayerItem(e.target.id);
            }
        }
    });

    updateTextToolUI(null); // 초기 텍스트 UI 상태 설정
    console.log('Comic Creator Initialized!');
});