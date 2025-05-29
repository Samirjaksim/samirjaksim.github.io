// js/imageHandler.js
import { canvas } from './canvasSetup.js';
import { bringAllTextToFront } from './utils.js';

const imagePaletteContainer = document.querySelector('.image-palette'); // 이미지 목록과 업로드 버튼을 포함하는 부모 컨테이너
const unifiedImageUploadInput = document.getElementById('unified-image-upload');
const unifiedImageListDiv = document.getElementById('unified-image-list');

let draggedImageSrc = null;
// let draggedImageLayerType = null; // 이제 레이어 타입을 여기서 직접 관리하지 않음

// 파일들을 처리하여 팔레트에 이미지로 추가 (layerType 인자 제거)
function processFilesAndAddToPalette(files, targetPaletteElement) {
    if (!targetPaletteElement) {
        console.error("대상 팔레트 요소를 찾을 수 없습니다 (processFilesAndAddToPalette):", targetPaletteElement);
        return;
    }
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgElement = document.createElement('img');
                imgElement.src = e.target.result;
                imgElement.alt = `Uploaded - ${file.name}`; // 레이어 타입 정보 제거
                // imgElement.dataset.layerType = layerType; // 레이어 타입 dataset 제거
                imgElement.dataset.srcActual = e.target.result;
                targetPaletteElement.appendChild(imgElement);
            }
            reader.readAsDataURL(file);
        } else {
            console.warn(`Skipping non-image file: ${file.name}`);
        }
    }
}

export function initializeImageHandling() {
    // 파일 업로드 입력(<input type="file">) 처리
    if (unifiedImageUploadInput && unifiedImageListDiv) {
        unifiedImageUploadInput.addEventListener('change', function(event) {
            const files = event.target.files;
            processFilesAndAddToPalette(files, unifiedImageListDiv);
            event.target.value = null; // 같은 파일 다시 선택 가능하도록
        });

        // 드래그 앤 드롭 기능 (통합된 이미지 목록 영역)
        unifiedImageListDiv.addEventListener('dragenter', function(event) {
            event.preventDefault(); event.stopPropagation();
            this.classList.add('drag-over');
        });
        unifiedImageListDiv.addEventListener('dragover', function(event) {
            event.preventDefault(); event.stopPropagation();
            this.classList.add('drag-over');
        });
        unifiedImageListDiv.addEventListener('dragleave', function(event) {
            event.preventDefault(); event.stopPropagation();
            if (!this.contains(event.relatedTarget)) { this.classList.remove('drag-over'); }
        });
        unifiedImageListDiv.addEventListener('drop', function(event) {
            event.preventDefault(); event.stopPropagation();
            this.classList.remove('drag-over');
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                processFilesAndAddToPalette(files, this); // 'this'는 unifiedImageListDiv
            }
        });
    } else {
        console.error("Unified image upload elements not found!");
    }

    // 이미지 팔레트 더블클릭 시 캔버스에 추가
    if (imagePaletteContainer) { // 이벤트 리스너를 부모 컨테이너에 설정
        imagePaletteContainer.addEventListener('dblclick', (event) => {
            // 클릭된 대상이 이미지이고, unified-image-list 내부에 있는지 확인
            if (event.target.tagName === 'IMG' && event.target.dataset.srcActual && event.target.closest('#unified-image-list')) {
                const imgSrc = event.target.dataset.srcActual;
                // const layerType = event.target.dataset.layerType; // 더 이상 사용 안 함

                fabric.Image.fromURL(imgSrc, (img) => {
                    const maxDim = 200;
                    if (img.width > maxDim || img.height > maxDim) {
                        if (img.width > img.height) { img.scaleToWidth(maxDim); }
                        else { img.scaleToHeight(maxDim); }
                    }
                    img.set({
                        left: canvas.width / 2 - (img.getScaledWidth() / 2) + (Math.random() * 50 - 25),
                        top: canvas.height / 2 - (img.getScaledHeight() / 2) + (Math.random() * 50 - 25),
                        cornerColor: 'blue', cornerStrokeColor: 'blue', borderColor: 'blue',
                        transparentCorners: false, cornerSize: 10
                    });

                    canvas.add(img);
                    // 기본적으로 이미지는 특정 레이어 지정 없이 추가됨.
                    // 레이어 순서는 bringAllTextToFront()로 텍스트만 위로 오게 하고,
                    // 추후 레이어 편집기에서 사용자가 직접 순서나 타입을 지정.
                    // 만약 기본 레이어(예: '일반' 또는 '중간')로 설정하고 싶다면,
                    // img.set({ myLayerType: 'default' }); 등으로 사용자 정의 속성 추가 가능
                }, { crossOrigin: 'anonymous' });
            }
        });

        // 이미지 팔레트에서 이미지 우클릭 시 삭제
        imagePaletteContainer.addEventListener('contextmenu', function(event) {
            if (event.target.tagName === 'IMG' && event.target.closest('#unified-image-list')) {
                event.preventDefault();
                event.target.remove();
            }
        });

        // 이미지 팔레트에서 이미지 드래그 시작 (캔버스 일반 드롭용)
        imagePaletteContainer.addEventListener('dragstart', (event) => {
            if (event.target.tagName === 'IMG' && event.target.dataset.srcActual && event.target.closest('#unified-image-list')) {
                draggedImageSrc = event.target.dataset.srcActual;
                // draggedImageLayerType = event.target.dataset.layerType; // 더 이상 사용 안 함
                event.dataTransfer.setData('text/plain', draggedImageSrc);
                event.dataTransfer.effectAllowed = 'copy';
            } else {
                draggedImageSrc = null;
                // draggedImageLayerType = null;
            }
        });
    }


    // 캔버스 위에서 드롭 이벤트 처리 (일반 이미지 추가)
    canvas.on('drop', function(options) {
        options.e.preventDefault();
        const event = options.e;

        if (draggedImageSrc) { // 팔레트에서 드래그된 이미지가 있을 때
            fabric.Image.fromURL(draggedImageSrc, (img) => {
                const maxDim = 200;
                if (img.width > maxDim || img.height > maxDim) {
                    if (img.width > img.height) { img.scaleToWidth(maxDim); }
                    else { img.scaleToHeight(maxDim); }
                }
                const pointer = canvas.getPointer(event);
                img.set({
                    left: pointer.x - (img.getScaledWidth() / 2),
                    top: pointer.y - (img.getScaledHeight() / 2),
                    cornerColor: 'blue', cornerStrokeColor: 'blue', borderColor: 'blue',
                    transparentCorners: false, cornerSize: 10
                });
                // if (draggedImageLayerType === 'background') { // 더 이상 사용 안 함
                // canvas.sendToBack(img);
                // }
                canvas.add(img);
            }, { crossOrigin: 'anonymous' });
            
            draggedImageSrc = null;
            // draggedImageLayerType = null;
        }
    });

    canvas.on('dragover', function(options) {
        options.e.preventDefault();
    });
}