// js/dragDrop.js - 드래그 앤 드롭 기능만 담당합니다.

const placeholder = document.createElement('div');
placeholder.className = 'drag-placeholder';

/**
 * 드롭존(container) 내에서 마우스 좌표(x, y)에 가장 가까운 요소를 찾습니다.
 */
function findClosestElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    if (draggableElements.length === 0) {
        return null;
    }
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
    zone.addEventListener('dragover', e => {
        e.preventDefault(); 
        zone.classList.add('drag-over');

        const closestElement = findClosestElement(zone, e.clientX, e.clientY);
        
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

    zone.addEventListener('drop', e => {
        e.preventDefault();
        /** e.stopPropagation(); // 이 줄은 그대로 두어도 안전합니다. **/

        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(id);
        
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

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            if (placeholder.parentNode) {
                placeholder.remove();
            }
        });

        draggable.dataset.listenerAttached = 'true';
    });
}

/**
 * 페이지 로드 시 존재하는 모든 드롭존들을 찾아 이벤트를 설정합니다.
 */
export function initializeDropzones() {
    const dropzones = document.querySelectorAll('.tier-items, .unranked-items');
    dropzones.forEach(zone => addDropzoneEvents(zone));
}