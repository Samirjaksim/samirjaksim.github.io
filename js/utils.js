// js/utils.js
import { canvas } from './canvasSetup.js';

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