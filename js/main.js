// js/main.js
import { canvas } from './canvasSetup.js';
import { initializeImageHandling } from './imageHandler.js'; // imageHandler 내부에서 bringAllTextToFront 호출 없는지 확인 필요
import { initializeTextTool, updateTextToolUI } from './textTool.js'; // textTool 내부에서 bringAllTextToFront 호출 없는지 확인 필요
import { initializeFrameTool } from './frameTool.js';
import { initializeObjectControls } from './objectControls.js';
import { initializeBrushTool } from './brushTool.js';
import { addLayerItem, removeLayerItem, updateSelectedLayerItem, rerenderLayerList } from './layerEditor.js'; // rerenderLayerList가 import 되었는지 확인

// js/main.js (또는 js/fontLoader.js 만들고 main.js에서 import)

// WebFontLoader가 로드된 후 실행되도록 함 (DOMContentLoaded 내부 또는 이후)
// 만약 WebFontLoader 스크립트가 head에 있다면, DOMContentLoaded에서 바로 사용 가능
function loadWebFonts() {
    if (typeof WebFont !== 'undefined') { // WebFont 객체가 존재하는지 확인
        WebFont.load({
            google: {
                families: [
                    'Nanum Gothic:400,700', // 나눔고딕
                    // 여기에 다른 Google Fonts를 추가할 수 있습니다.
                    // 예: 'Roboto:400,700', 'Montserrat'
                ]
            },
            custom: { // Google Fonts 외 다른 셔츠 제공처의 폰트도 로드 가능
                families: [
                    // 'NanumSquare', // 만약 NanumSquare도 WebFontLoader로 관리하고 싶다면
                                    // 이 경우, index.html의 @import 대신 여기에 설정
                ],
                // urls: [ 'css/nanumsquare.css' ] // 로컬 CSS 파일 경로 (예시)
            },
            active: function() {
                console.log('Web fonts loaded (Nanum Gothic etc.).');
                // 폰트 로딩 후 캔버스에 적용된 텍스트가 있다면 리렌더링 필요할 수 있음
                // (Fabric.js는 폰트 변경 시 자동으로 리렌더링을 시도하지만,
                //  외부에서 폰트가 비동기 로드되는 경우 명시적 렌더링이 필요할 수 있음)
                if (window.canvas) { // 전역 canvas 객체가 있다면 (또는 import한 canvas 사용)
                    // canvas.requestRenderAll(); // Fabric.js 5.x 이상 권장
                    // 모든 객체를 순회하며 폰트 적용된 텍스트 객체만 dirty = true 처리 후 renderAll도 가능
                }
            },
            inactive: function() {
                console.warn('Some web fonts could not be loaded.');
            },
            // fontloading: function(familyName, fvd) {}, // 각 폰트 로딩 시작 시
            // fontactive: function(familyName, fvd) {}, // 각 폰트 로딩 완료 시
            // fontinactive: function(familyName, fvd) {}, // 각 폰트 로딩 실패 시
            timeout: 3000 // 폰트 로딩 타임아웃 (ms) (기본값은 3초)
        });
    } else {
        // WebFont 객체가 없으면, 스크립트 로드가 안 되었거나 타이밍 문제일 수 있음
        // setTimeout으로 재시도하거나, 스크립트 로드 순서 확인
        console.error('WebFontLoader not available. Retrying in 1s.');
        setTimeout(loadWebFonts, 1000); // 1초 후 재시도 (간단한 예)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 각 모듈 초기화
    initializeImageHandling();
    initializeTextTool();
    initializeFrameTool();
    initializeObjectControls();
    initializeBrushTool();

    // 캔버스 전역 이벤트 핸들러
    canvas.on({
        'object:added': (e) => {
            if (e.target) {
                addLayerItem(e.target);
            }
            // 객체 추가 시 레이어 목록 전체를 다시 그려 순서를 맞춤
            // Fabric.js는 기본적으로 새로 추가된 객체를 가장 위에 렌더링.
            // addLayerItem은 목록의 맨 앞에 아이템을 추가.
            // 따라서 rerenderLayerList를 호출하여 캔버스의 실제 순서와 목록을 동기화.
            rerenderLayerList(); // 객체 추가 후 레이어 목록 업데이트

            if (e.target) {
                canvas.setActiveObject(e.target); // 새로 추가된 객체 활성화
            }
        },
        'object:removed': (e) => {
            if (e.target && e.target.id) {
                removeLayerItem(e.target.id); // 레이어 편집기에서 아이템 제거 (이것만으로도 충분할 수 있음)
            }
            // 객체 제거 후에도 레이어 목록 전체를 다시 그려 정확한 상태 반영
            rerenderLayerList();
            // 만약 목록이 비었다면, rerenderLayerList 내부에서 처리되거나, 여기서 추가로 DOM 비우기 가능
            if (canvas.getObjects().length === 0) {
                document.getElementById('layer-list').innerHTML = '';
            }
        },
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
        },
        'text:editing:exited': (e) => {
            const activeObject = canvas.getActiveObject();
            if (activeObject === e.target) {
                updateTextToolUI(activeObject);
                updateSelectedLayerItem(activeObject.id);
            }
        },
        'object:modified': (e) => {
            // 객체 수정(이동, 크기 변경 등)은 Fabric.js 내부 객체 배열 순서를 바꾸지 않음.
            // 따라서 레이어 목록을 다시 그릴 필요는 없음. (만약 z-index 변경 기능이 있다면 그때 필요)
            if (e.target && (e.target.isType('i-text') || e.target.isType('textbox'))) {
                updateTextToolUI(e.target);
            }
        },
        'path:created': (e) => { // 자유 그리기로 생성된 경로 객체
            if (e.path) { // e.path는 생성된 fabric.Path 객체
                // console.log('Path created:', e.path);
                // 생성된 Path 객체에 ID를 부여하거나, 레이어 목록에 추가하는 로직
                // addLayerItem(e.path); // main.js에서 addLayerItem을 직접 호출하거나,
                                        // object:added 이벤트가 Path 객체에도 발생하도록 해야 함.
                                        // Fabric.js에서 isDrawingMode로 그린 path는 object:added를 자동 발생시키지 않을 수 있음.
                // 이 경우, 여기서 수동으로 addLayerItem 호출 필요.
                // 그리고 Path 객체도 다른 객체처럼 레이어 편집기에서 관리되도록 해야 함.
                
                // object:added 이벤트가 path에도 발생한다면 아래 로직은 필요 없음
                if (typeof addLayerItem === 'function' && e.path) {
                     // Path 객체도 일반 객체처럼 취급하기 위해 ID 부여 및 레이어 추가
                    if (!e.path.id) {
                        e.path.id = 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    }
                    // e.path.customName = '그림'; // 기본 이름 설정
                    addLayerItem(e.path); // 레이어 편집기에 추가
                    rerenderLayerList(); // 목록 순서 동기화
                    updateSelectedLayerItem(e.path.id); // 선택 표시
                    canvas.setActiveObject(e.path); // 그린 그림 바로 선택
                }
            }
        }
    });

    updateTextToolUI(null); // 초기 텍스트 UI 상태 설정
    loadWebFonts(); // 웹 폰트 로드 함수 호출
    console.log('Comic Creator Initialized!');
});