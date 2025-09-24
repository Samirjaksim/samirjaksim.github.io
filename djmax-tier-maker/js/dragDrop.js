// js/dragDrop.js - 드래그 앤 드롭 기능만 담당합니다.

// ▼▼▼▼▼ 플레이스홀더 요소를 미리 생성합니다. ▼▼▼▼▼
const placeholder = document.createElement('div');
placeholder.className = 'drag-placeholder';


/**
 * 드롭존(container) 내에서 마우스 좌표(x, y)에 가장 가까운 요소를 찾습니다.
 * (이 함수는 이전과 동일합니다)
 */
function findClosestElement(container, x, y) {
    // ... (이 함수의 내용은 변경 없습니다)
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    if (draggableElements.length === 0) return null;
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const distance = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
        if (distance < closest.distance) {
            return { distance: distance, element: child };
        } else {
            return closest;
        }
    }, { distance: Number.POSITIVE_INFINITY, element: null }).element;
}


/**
 * 드롭존(dropzone) 하나에 드래그 관련 이벤트 리스너들을 추가합니다.
 */
export function addDropzoneEvents(zone) {
    // ▼▼▼▼▼ 'dragover' 이벤트 로직이 핵심으로 변경됩니다. ▼▼▼▼▼
    zone.addEventListener('dragover', e => {
        e.preventDefault(); 
        zone.classList.add('drag-over');

        // 1. 가장 가까운 요소를 실시간으로 찾습니다.
        const closestElement = findClosestElement(zone, e.clientX, e.clientY);
        
        // 2. 찾은 위치에 플레이스홀더를 삽입합니다.
        if (closestElement === null) {
            zone.appendChild(placeholder);
        } else {
            const box = closestElement.getBoundingClientRect();
            if (e.clientX < box.left + box.width / 2) {
                zone.insertBefore(placeholder, closestElement);
            } else {
                zone.insertBefore(placeholder, closestElement.nextSibling);
            }
        }
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    // ▼▼▼▼▼ 'drop' 이벤트 로직이 매우 간단해집니다. ▼▼▼▼▼
    zone.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();

        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(id);
        
        // 플레이스홀더가 있는 위치를 찾아 실제 요소로 교체합니다.
        if (placeholder.parentNode === zone) {
            placeholder.replaceWith(draggableElement);
        }
    });
}

/**
 * 페이지 내의 모든 드래그 가능한(.draggable) 아이템들에 이벤트 리스너를 설정합니다.
 */
export function initializeDraggables() {
    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach(draggable => {
        if (draggable.dataset.listenerAttached) return;

        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
            setTimeout(() => draggable.classList.add('dragging'), 0);
        });

        // ▼▼▼▼▼ 'dragend' 이벤트에서 플레이스홀더를 확실히 제거합니다. ▼▼▼▼▼
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            // 드롭이 성공하든 취소되든, 화면에 남아있는 플레이스홀더를 제거합니다.
            if (placeholder.parentNode) {
                placeholder.remove();
            }
        });

        draggable.dataset.listenerAttached = 'true';
    });
}

// ... (initializeDropzones 와 initializeDeletionDrop 함수는 변경 없습니다) ...
export function initializeDropzones() {
    const dropzones = document.querySelectorAll('.tier-items, .unranked-items');
    dropzones.forEach(zone => addDropzoneEvents(zone));
}

export function initializeDeletionDrop() {
    const body = document.body;
    body.addEventListener('dragover', e => { e.preventDefault(); });
    body.addEventListener('drop', e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(id);
        if (draggableElement) {
            draggableElement.remove();
        }
    });
}