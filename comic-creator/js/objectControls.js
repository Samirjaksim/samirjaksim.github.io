// js/objectControls.js
import { canvas } from './canvasSetup.js';
// import { bringAllTextToFront } from './utils.js';
import { updateTextToolUI } from './textTool.js';
// removeLayerItem은 object:removed 이벤트에서 처리되므로 직접 import 필요 없음
// rerenderLayerList는 레이어 순서 변경 시 필요
import { rerenderLayerList, updateSelectedLayerItem } from './layerEditor.js';
import { saveCanvasState } from './historyHandler.js'; // 상태 저장을 위해 import

// 버튼 DOM 요소 참조
const removeSelectedButton = document.getElementById('remove-selected'); // 기존 선택 객체 삭제 버튼
const comicFilterButton = document.getElementById('apply-comic-filter');
const contrastSlider = document.getElementById('contrast-slider'); // 대비 슬라이더
const contrastValueDisplay = document.getElementById('contrast-value'); // 대비 값 표시 span
const revertOriginalFilterButton = document.getElementById('revert-original-filter');
const clearButton = document.getElementById('clear-canvas');
const exportButton = document.getElementById('export-image');

// 레이어 편집기 패널 하단 컨트롤 버튼
const layerUpButton = document.getElementById('layer-up-button');
const layerDownButton = document.getElementById('layer-down-button');
const layerDeleteButton = document.getElementById('layer-delete-button');


// --- 헬퍼 함수 (이 파일 내에서만 사용) ---
function applyGrayscaleComicFilter(imageObject) {
    if (!imageObject || !imageObject.isType('image')) {
        alert("이미지 객체에만 필터를 적용할 수 있습니다.");
        return false;
    }
    imageObject.filters = []; // 기존 필터 초기화
    imageObject.filters.push(new fabric.Image.filters.Grayscale());
    imageObject.filters.push(new fabric.Image.filters.Contrast({
        contrast: contrastSlider.value / 100
    }));
    imageObject.applyFilters();
    canvas.renderAll();
    return true;
}

function revertToOriginal(imageObject) {
    if (!imageObject || !imageObject.isType('image')) {
        alert("이미지 객체만 원본으로 되돌릴 수 있습니다.");
        return;
    }
    imageObject.filters = [];
    imageObject.applyFilters();
    canvas.renderAll();
}

// --- 초기화 함수 ---
export function initializeObjectControls() {



    // 1. 기존 선택 객체 삭제 버튼 (팔레트 하단)
    if (removeSelectedButton) {
        removeSelectedButton.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            const activeObjects = canvas.getActiveObjects(); // 다중 선택 고려

            if (activeObject) { // 단일 선택 객체 삭제
                canvas.remove(activeObject);
            } else if (activeObjects && activeObjects.length > 0) { // 다중 선택 객체 삭제
                activeObjects.forEach(obj => canvas.remove(obj));
                canvas.discardActiveObject(); // 다중 선택 해제
            } else {
                alert("삭제할 객체를 먼저 선택해주세요.");
                return; // 아무것도 선택되지 않았으면 여기서 종료
            }
            // canvas.renderAll(); // remove 후 자동 렌더링 또는 object:removed에서 처리
            // updateTextToolUI(null); // selection:cleared 이벤트에서 처리
            // 레이어 목록 업데이트는 object:removed 이벤트에서 처리
        });
    }

    // 대비 슬라이더 값 변경 시 UI 업데이트
    if (contrastSlider && contrastValueDisplay) {
        contrastSlider.addEventListener('input', (event) => {
            // 슬라이더 값(-100 ~ 100)을 Fabric.js Contrast 필터 값(-1 ~ 1)으로 변환
            const sliderValue = parseInt(event.target.value, 10);
            const filterValue = sliderValue / 100;
            contrastValueDisplay.textContent = filterValue.toFixed(2); // 소수점 2자리까지 표시

            // (선택 사항) 슬라이더 조작 중 실시간으로 필터 미리보기 적용
            // const activeObject = canvas.getActiveObject();
            // if (activeObject && activeObject.isType('image')) {
            //     // 현재 그레이스케일 상태는 유지하면서 대비만 변경하는 임시 필터 적용
            //     // 또는, applyGrayscaleComicFilter를 호출하되, 히스토리 저장은 막음
            //     // (이 부분은 UX를 고려하여 신중히 구현해야 함. 여기서는 버튼 클릭 시에만 적용)
            // }
        });
    } else {
        console.warn("Contrast slider UI elements not found.");
    }

    // 2. 흑백 만화 필터 적용 버튼
    if (comicFilterButton && contrastSlider) {
        comicFilterButton.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            const sliderValue = parseInt(contrastSlider.value, 10);
            const contrastLevel = sliderValue / 100; // -1 ~ 1 범위로 변환

            let applied = false; // 필터가 한 번이라도 적용되었는지 추적

            if (activeObject && activeObject.isType('image')) {
                if (applyGrayscaleComicFilter(activeObject, contrastLevel)) {
                    applied = true;
                }
            } else {
                const activeObjects = canvas.getActiveObjects();
                if (activeObjects && activeObjects.length > 0) {
                    activeObjects.forEach(obj => {
                        if (obj.isType('image')) {
                            if (applyGrayscaleComicFilter(obj, contrastLevel)) {
                                applied = true; // 성공적으로 적용되면 플래그 설정
                            }
                        }
                    });
                }
            }

            if (applied) {
                // bringAllTextToFront(); // 모든 레이어 평등 원칙에 따라 제거
                saveCanvasState(); // 필터 적용 후 상태 저장
            } else {
                alert("필터를 적용할 이미지를 선택해주세요.");
            }
        });
    }

    // 3. 원본 이미지로 되돌리기 버튼
    if (revertOriginalFilterButton) {
        revertOriginalFilterButton.addEventListener('click', () => {
            // ... (기존 revert 로직과 유사, saveCanvasState 호출 추가) ...
            let reverted = false;
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.isType('image')) {
                revertToOriginal(activeObject);
                reverted = true;
            } else {
                const activeObjects = canvas.getActiveObjects();
                if (activeObjects && activeObjects.length > 0) {
                    activeObjects.forEach(obj => {
                        if (obj.isType('image')) {
                            revertToOriginal(obj);
                            reverted = true;
                        }
                    });
                }
            }
            if (reverted) {
                // bringAllTextToFront(); // 제거
                saveCanvasState(); // 상태 저장
            } else {
                alert("원본으로 되돌릴 이미지를 선택해주세요.");
            }
        });
    }

    // 4. 캔버스 전체 비우기 버튼
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm("캔버스의 모든 내용을 지우시겠습니까?")) {
                canvas.clear(); // 모든 객체와 필터 등 제거
                canvas.backgroundColor = 'white'; // 배경색도 초기화 (필요시)
                // updateTextToolUI(null); // selection:cleared 이벤트에서 처리될 것임
                // rerenderLayerList(); // object:removed가 여러 번 발생하며 목록이 비워짐
                // 또는 여기서 layerListUl.innerHTML = ''; 로 직접 비워도 됨
                // 하지만 가장 확실한 것은 빈 캔버스에 맞춰 rerenderLayerList 호출
                document.getElementById('layer-list').innerHTML = ''; // 레이어 목록 직접 비우기
                updateTextToolUI(null); // 텍스트 UI 초기화
                updateSelectedLayerItem(null); // 레이어 선택 UI 초기화
                canvas.renderAll();
            }
        });
    }

    // 5. 이미지로 저장 버튼
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            canvas.discardActiveObject(); // 컨트롤러 숨기기
            canvas.renderAll(); // 최종 렌더링

            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 0.9, // jpeg일 경우 품질
                // multiplier: 2 // 해상도를 높이고 싶을 때 (예: 2배)
            });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'comic-scene.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // 6. 레이어 편집기 패널 - 위로 버튼
    if (layerUpButton) {
        layerUpButton.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.bringForward(activeObject); // 한 단계 위로
                // canvas.bringToFront(activeObject); // 맨 위로 (텍스트 제외한 객체들 중에서)
                
                rerenderLayerList(); // 레이어 목록 UI 전체 업데이트
                // updateSelectedLayerItem(activeObject.id); // rerenderLayerList 후 선택 유지
                canvas.renderAll();
                saveCanvasState(); // <<--- 레이어 순서 변경은 명시적 상태 변경이므로 저장
            } else {
                alert("순서를 변경할 객체를 레이어 목록 또는 캔버스에서 선택해주세요.");
            }
        });
    }

    // 7. 레이어 편집기 패널 - 아래로 버튼
    if (layerDownButton) {
        layerDownButton.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                // 텍스트 객체는 맨 아래로 내려가지 않도록 예외 처리 가능
                if (activeObject.isType('i-text') || activeObject.isType('textbox')) {
                    // 텍스트 객체를 맨 아래로 보내는 것은 보통 원치 않음
                    // 하지만 다른 객체들 사이에서는 순서 변경이 가능해야 함
                    // sendBackwards는 다른 텍스트보다는 아래로, 이미지보다는 위로 갈 수 있음
                    // 이 부분은 레이어링 정책에 따라 더 정교한 로직 필요 가능
                }
                canvas.sendBackwards(activeObject); // 한 단계 아래로
                // canvas.sendToBack(activeObject); // 맨 아래로
                
                rerenderLayerList(); // 레이어 목록 UI 전체 업데이트
                // updateSelectedLayerItem(activeObject.id); // rerenderLayerList 후 선택 유지
                canvas.renderAll();
                saveCanvasState(); // <<--- 레이어 순서 변경은 명시적 상태 변경이므로 저장
            } else {
                alert("순서를 변경할 객체를 레이어 목록 또는 캔버스에서 선택해주세요.");
            }
        });
    }

    // 8. 레이어 편집기 패널 - 삭제 버튼
    if (layerDeleteButton) {
        layerDeleteButton.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            const activeObjects = canvas.getActiveObjects();

            if (activeObject) {
                canvas.remove(activeObject);
            } else if (activeObjects.length > 0) {
                activeObjects.forEach(obj => canvas.remove(obj));
                canvas.discardActiveObject();
            } else {
                alert("삭제할 객체를 레이어 목록 또는 캔버스에서 선택해주세요.");
                return;
            }
            // 레이어 목록 업데이트는 object:removed 이벤트에서 처리됨
            // 캔버스 렌더링도 remove 후 자동 또는 이벤트 체인으로 처리될 수 있음
            // canvas.renderAll(); (필요시)
        });
    }


    // 9. 키보드 이벤트 (객체 삭제)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeElement = document.activeElement;
            // 입력 필드 등에 포커스가 있을 때는 캔버스 객체 삭제 방지
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
                // IText가 편집 중일 때 Backspace는 텍스트 내용을 지우도록 허용
                if (activeElement.isContentEditable && e.key === 'Backspace') {
                    // IText 내부 편집 로직이 처리하도록 여기서 막지 않음
                } else if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                    return; // 다른 input 필드에서는 기본 동작 유지
                }
                // 만약 IText 편집 중 Delete 키로 객체 전체 삭제를 막고 싶다면 추가 조건 필요
            }

            const activeObject = canvas.getActiveObject();
            const activeObjects = canvas.getActiveObjects();
            let removed = false;

            // IText 편집 중이 아닐 때만 객체 삭제 로직 실행
            if (activeObject && activeObject.isEditing && (e.key === 'Delete' || e.key === 'Backspace')) {
                // 편집 중일 때는 Delete/Backspace가 텍스트 내용에 작용하도록 놔둠
                return;
            }

            if (activeObject) {
                canvas.remove(activeObject);
                removed = true;
            } else if (activeObjects.length > 0) {
                activeObjects.forEach(obj => canvas.remove(obj));
                canvas.discardActiveObject();
                removed = true;
            }

            if (removed) {
                // canvas.renderAll(); // object:removed 에서 처리될 수 있음
                // updateTextToolUI(null); // selection:cleared 에서 처리될 수 있음
                // rerenderLayerList(); // object:removed 에서 처리될 수 있음
                e.preventDefault(); // 캔버스 객체 삭제 시 브라우저 기본 동작 (예: 뒤로가기) 방지
            }
        }
    });
}