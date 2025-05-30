// js/canvasControls.js
import { canvas } from './canvasSetup.js';
import { saveCanvasState, clearHistory } from './historyHandler.js'; // clearHistory 추가
import { rerenderLayerList, updateSelectedLayerItem } from './layerEditor.js'; // 레이어 목록 업데이트
import { updateTextToolUI } from './textTool.js'; // 텍스트 도구 UI 업데이트

const landscapePresetRadio = document.getElementById('canvas-preset-landscape');
const portraitPresetRadio = document.getElementById('canvas-preset-portrait');

// 캔버스 프리셋 크기 정의
const PRESET_SIZES = {
    landscape: { width: 800, height: 600 }, // 가로 넓게 (기본)
    portrait: { width: 600, height: 800 }   // 세로 넓게 (만화 페이지 느낌, A4 비율과 유사하게 조절 가능)
};

let currentCanvasBackgroundColor = canvas.backgroundColor || 'white'; // 초기 배경색 가져오거나 기본값

/**
 * 지정된 프리셋 또는 크기로 캔버스 크기를 변경합니다.
 * 객체가 있다면 사용자에게 경고 후 모두 삭제합니다.
 * @param {string} presetName - 'landscape' 또는 'portrait'
 * @param {object} [customSize] - { width, height } (프리셋 대신 사용자 정의 크기)
 */
function changeCanvasSize(presetName, customSize) {
    let newWidth, newHeight;

    if (customSize && customSize.width && customSize.height) {
        newWidth = customSize.width;
        newHeight = customSize.height;
    } else if (PRESET_SIZES[presetName]) {
        newWidth = PRESET_SIZES[presetName].width;
        newHeight = PRESET_SIZES[presetName].height;
    } else {
        console.error("Invalid canvas size preset or custom size.");
        return;
    }

    // 현재 캔버스 크기와 동일하다면 변경 안 함
    if (canvas.getWidth() === newWidth && canvas.getHeight() === newHeight) {
        return;
    }

    // 캔버스에 객체가 있는지 확인
    if (canvas.getObjects().length > 0) {
        if (!confirm("캔버스 크기를 변경하면 현재 작업 내용이 모두 사라집니다. 계속하시겠습니까?")) {
            // 사용자가 '취소'를 선택하면, 라디오 버튼 선택을 원래대로 되돌림
            if (canvas.getWidth() === PRESET_SIZES.landscape.width && canvas.getHeight() === PRESET_SIZES.landscape.height) {
                if(landscapePresetRadio) landscapePresetRadio.checked = true;
            } else if (canvas.getWidth() === PRESET_SIZES.portrait.width && canvas.getHeight() === PRESET_SIZES.portrait.height) {
                if(portraitPresetRadio) portraitPresetRadio.checked = true;
            } else {
                // 현재 크기가 프리셋과 일치하지 않으면, 이전 라디오 버튼 상태를 알 수 없음.
                // 이 경우, UI상으로는 라디오 버튼이 바뀐 채로 남을 수 있음. (개선 필요)
            }
            return; // 작업 중단
        }
        // 사용자가 '확인'을 선택하면 모든 객체 제거
        canvas.clear(); // 모든 객체 제거 (이로 인해 object:removed 이벤트 다수 발생 가능)
        clearHistory(); // Undo/Redo 히스토리도 초기화
        // 레이어 목록도 비워야 함 (canvas.clear() 후 object:removed가 발생하지 않으므로 직접 처리)
        document.getElementById('layer-list').innerHTML = '';
        updateSelectedLayerItem(null);
        updateTextToolUI(null);

    }

    canvas.backgroundColor = 'white';
    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);
    canvas.setZoom(1); // 줌 레벨 초기화
    canvas.calcOffset(); // 캔버스 오프셋 재계산
    canvas.renderAll();

    console.log(`Canvas size changed to: ${newWidth}x${newHeight}`);
    saveCanvasState(); // 변경된 빈 캔버스 상태를 히스토리에 저장 (새 작업 시작점)
}

export function initializeCanvasControls() {
    // ... (기존 canvasScaleSlider 관련 로직은 제거 또는 주석 처리, 요청에 따라 폐기) ...

    if (!canvas.backgroundColor) {
        canvas.backgroundColor = 'white'; // 기본 배경색 설정
        canvas.renderAll(); // 초기 렌더링
    }

    if (!landscapePresetRadio || !portraitPresetRadio) {
        console.warn("Canvas preset radio buttons not found. Canvas size preset will not be initialized.");
        return;
    }

    // 초기 캔버스 크기에 맞춰 라디오 버튼 상태 설정 (페이지 로드 시)
    // HTML에서 기본 checked를 landscape로 했으므로, JS에서는 그 값을 사용.
    // 만약 JS에서 canvas 크기를 동적으로 설정한다면, 여기서 라디오 버튼도 맞춰야 함.
    // canvas.setWidth(PRESET_SIZES.landscape.width); // JS에서 초기 크기 설정 예시
    // canvas.setHeight(PRESET_SIZES.landscape.height);
    // canvas.renderAll(); // 초기 렌더링

    landscapePresetRadio.addEventListener('change', () => {
        if (landscapePresetRadio.checked) {
            changeCanvasSize('landscape');
        }
    });

    portraitPresetRadio.addEventListener('change', () => {
        if (portraitPresetRadio.checked) {
            changeCanvasSize('portrait');
        }
    });
}