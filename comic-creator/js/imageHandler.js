// js/imageHandler.js
import { canvas } from './canvasSetup.js';
// import { bringAllTextToFront } from './utils.js'; // main.js에서 object:added 시 처리하므로 여기서 호출 불필요

const imagePaletteContainer = document.querySelector('.image-palette');
const unifiedImageUploadInput = document.getElementById('unified-image-upload');
const unifiedImageListDiv = document.getElementById('unified-image-list');

let draggedImageSrc = null; // 팔레트에서 캔버스로 드래그 중인 이미지의 src

/**
 * 이미지 목록의 상태(비어있는지 여부)에 따라 안내 문구의 표시/숨김을 업데이트합니다.
 */
function updateEmptyMessageVisibility() {
    if (!unifiedImageListDiv) return;
    // 안내 문구는 unifiedImageListDiv 내에 .empty-library-message 클래스로 존재해야 함
    const emptyMessage = unifiedImageListDiv.querySelector('.empty-library-message');
    if (!emptyMessage) {
        // console.warn('.empty-library-message not found in #unified-image-list');
        return;
    }

    // 이미지 목록 내에 실제로 추가된 <img> 태그가 하나라도 있는지 확인
    const hasImages = unifiedImageListDiv.querySelector('img') !== null;

    if (hasImages) {
        emptyMessage.style.display = 'none'; // 이미지가 있으면 메시지 숨김
        unifiedImageListDiv.classList.remove('is-empty'); // CSS 스타일링용 클래스 제거
    } else {
        emptyMessage.style.display = 'block'; // 이미지가 없으면 메시지 표시
        unifiedImageListDiv.classList.add('is-empty');  // CSS 스타일링용 클래스 추가
    }
}

/**
 * 선택/드롭된 파일들을 처리하여 이미지 라이브러리 팔레트에 썸네일로 추가합니다.
 * @param {FileList} files - 사용자가 선택하거나 드롭한 파일 목록
 * @param {HTMLElement} targetPaletteElement - 이미지를 추가할 DOM 요소 (여기서는 unifiedImageListDiv)
 */
function processFilesAndAddToPalette(files, targetPaletteElement) {
    if (!targetPaletteElement) {
        console.error("Target palette element for adding images is not defined.");
        return;
    }
    if (!files || files.length === 0) {
        updateEmptyMessageVisibility(); // 파일이 없으면 메시지 상태 한번 더 확인
        return;
    }

    let imageFilesProcessedCount = 0;
    const imageFilesToProcess = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFilesToProcess.length === 0) { // 이미지 파일이 하나도 없는 경우
        updateEmptyMessageVisibility(); // 메시지 상태 업데이트
        return;
    }

    imageFilesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.alt = `Uploaded - ${file.name}`;
            imgElement.dataset.srcActual = e.target.result; // 캔버스 추가 시 사용할 원본 데이터
            targetPaletteElement.appendChild(imgElement);
            
            imageFilesProcessedCount++;
            // 모든 '이미지' 파일 처리가 완료되었을 때만 메시지 상태 업데이트
            if (imageFilesProcessedCount === imageFilesToProcess.length) {
                updateEmptyMessageVisibility();
            }
        }
        reader.onerror = () => {
            console.error(`Error reading file: ${file.name}`);
            imageFilesProcessedCount++;
            if (imageFilesProcessedCount === imageFilesToProcess.length) {
                updateEmptyMessageVisibility();
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 이미지 핸들링 관련 기능들을 초기화합니다. (파일 업로드, 드래그앤드롭, 팔레트 상호작용)
 */
export function initializeImageHandling() {
    if (!unifiedImageUploadInput || !unifiedImageListDiv) {
        console.error("Unified image upload input or list div not found. Image handling not initialized.");
        return;
    }

    // 파일 선택(<input type="file">) 시 처리
    unifiedImageUploadInput.addEventListener('change', function(event) {
        processFilesAndAddToPalette(event.target.files, unifiedImageListDiv);
        event.target.value = null; // 동일 파일 재선택 가능하도록 초기화
    });

    // 이미지 목록 영역으로 드래그 앤 드롭 기능
    unifiedImageListDiv.addEventListener('dragenter', function(event) {
        event.preventDefault(); event.stopPropagation();
        this.classList.add('drag-over');
    });
    unifiedImageListDiv.addEventListener('dragover', function(event) {
        event.preventDefault(); event.stopPropagation(); // 필수: drop 이벤트 발생 조건
        this.classList.add('drag-over'); // 일관된 피드백
    });
    unifiedImageListDiv.addEventListener('dragleave', function(event) {
        event.preventDefault(); event.stopPropagation();
        // 자식 요소를 지나갈 때 dragleave가 발생하지 않도록 정확히 체크
        if (event.target === this || !this.contains(event.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    });
    unifiedImageListDiv.addEventListener('drop', function(event) {
        event.preventDefault(); event.stopPropagation();
        this.classList.remove('drag-over');
        processFilesAndAddToPalette(event.dataTransfer.files, this);
    });

    // 이미지 팔레트(목록) 더블클릭 시 캔버스에 이미지 추가
    if (imagePaletteContainer) {
        imagePaletteContainer.addEventListener('dblclick', (event) => {
            if (event.target.tagName === 'IMG' && event.target.dataset.srcActual && event.target.closest('#unified-image-list')) {
                const imgSrc = event.target.dataset.srcActual;
                fabric.Image.fromURL(imgSrc, (img) => {
                    const maxDim = 200; // 캔버스에 추가될 때 초기 최대 크기
                    if (img.width > maxDim || img.height > maxDim) {
                        if (img.width > img.height) { img.scaleToWidth(maxDim); }
                        else { img.scaleToHeight(maxDim); }
                    }
                    img.set({ // 캔버스 중앙 근처에 랜덤하게 배치
                        left: canvas.width / 2 - (img.getScaledWidth() / 2) + (Math.random() * 40 - 20),
                        top: canvas.height / 2 - (img.getScaledHeight() / 2) + (Math.random() * 40 - 20),
                        cornerColor: 'blue',
                        // id, customName 등은 main.js의 object:added에서 처리
                    });
                    canvas.add(img); // main.js의 object:added 이벤트 발생
                                   // -> 레이어 추가, rerenderLayerList, saveCanvasState 등 처리
                }, { crossOrigin: 'anonymous' });
            }
        });

        // 이미지 팔레트에서 이미지 우클릭 시 해당 이미지 제거
        imagePaletteContainer.addEventListener('contextmenu', function(event) {
            if (event.target.tagName === 'IMG' && event.target.closest('#unified-image-list')) {
                event.preventDefault();
                event.target.remove(); // DOM에서 썸네일 이미지 제거
                updateEmptyMessageVisibility(); // 목록 상태 변경 후 안내 문구 업데이트
            }
        });

        // 이미지 팔레트에서 캔버스로 이미지 드래그 시작 시
        imagePaletteContainer.addEventListener('dragstart', (event) => {
            if (event.target.tagName === 'IMG' && event.target.dataset.srcActual && event.target.closest('#unified-image-list')) {
                draggedImageSrc = event.target.dataset.srcActual;
                event.dataTransfer.setData('text/plain', draggedImageSrc); // 드래그 데이터 설정
                event.dataTransfer.effectAllowed = 'copy';
            } else {
                draggedImageSrc = null;
            }
        });
    } else {
        console.warn("Image palette container not found, some interactions might not work.");
    }

    // 캔버스 위로 팔레트 이미지를 드롭했을 때 처리
    canvas.on('drop', function(options) {
        options.e.preventDefault(); // 브라우저 기본 동작(예: 파일 열기) 방지
        const event = options.e;

        if (draggedImageSrc) { // 팔레트에서 드래그 중인 이미지가 있을 경우
            fabric.Image.fromURL(draggedImageSrc, (img) => {
                const maxDim = 200;
                if (img.width > maxDim || img.height > maxDim) {
                    if (img.width > img.height) { img.scaleToWidth(maxDim); }
                    else { img.scaleToHeight(maxDim); }
                }
                const pointer = canvas.getPointer(event); // 드롭된 마우스 위치
                img.set({
                    left: pointer.x - (img.getScaledWidth() / 2),
                    top: pointer.y - (img.getScaledHeight() / 2),
                    cornerColor: 'blue',
                });
                canvas.add(img); // main.js의 object:added 이벤트 발생
            }, { crossOrigin: 'anonymous' });
            
            draggedImageSrc = null; // 드래그 완료 후 초기화
        }
        // 외부 파일을 캔버스에 직접 드롭하는 경우도 처리할 수 있음 (event.dataTransfer.files)
        // else if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        //     // processFilesAndAddToCanvas(event.dataTransfer.files); // 별도 함수로 처리
        // }
    });

    // 캔버스 위로 드래그 오버 시 (drop 이벤트 발생 조건)
    canvas.on('dragover', function(options) {
        options.e.preventDefault(); // 필수
    });

    // 초기 로드 시 이미지 목록 상태에 따라 안내 문구 표시 여부 결정
    updateEmptyMessageVisibility();
}