// js/utils.js
import { canvas } from './canvasSetup.js';

export function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export function bringAllTextToFront() {
    canvas.getObjects().forEach(obj => {
        if (obj.isType('i-text') || obj.isType('textbox')) {
            canvas.bringToFront(obj);
        }
    });
    canvas.renderAll();
}

// 다른 유틸리티 함수가 필요하면 여기에 추가
// 예: function generateUniqueId() { ... }