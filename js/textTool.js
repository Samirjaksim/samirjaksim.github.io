// js/textTool.js
import { canvas } from './canvasSetup.js';
import { bringAllTextToFront } from './utils.js'; // 만약 필요하다면

const textToolsContainer = document.getElementById('text-tools');
const textInput = document.getElementById('text-input');
const fontFamilySelect = document.getElementById('font-family-select');
const fontSizeInput = document.getElementById('font-size-input');
const textColorInput = document.getElementById('text-color-input');
const addTextButton = document.getElementById('add-text-button');

export function updateTextToolUI(activeObject) {
    if (activeObject && (activeObject.isType('i-text') || activeObject.isType('textbox'))) {
        textToolsContainer.classList.remove('disabled');
        textInput.value = activeObject.text || '';
        fontFamilySelect.value = activeObject.fontFamily || 'Arial';
        fontSizeInput.value = activeObject.fontSize || 40;
        textColorInput.value = activeObject.fill || '#000000';
    } else {
        textToolsContainer.classList.add('disabled');
    }
}

export function initializeTextTool() {
    addTextButton.addEventListener('click', () => {
        const textContent = textInput.value.trim() || "텍스트 입력";
        const textObject = new fabric.IText(textContent, {
            left: canvas.width / 2 - 50, top: canvas.height / 2 - 20,
            fontFamily: fontFamilySelect.value, fontSize: parseInt(fontSizeInput.value, 10),
            fill: textColorInput.value, padding: 5,
        });
        canvas.add(textObject);
        canvas.setActiveObject(textObject);
        textInput.value = '';
        // 텍스트 추가 시 항상 맨 위로 (Fabric.js는 기본적으로 맨 위에 추가하므로 bringAllTextToFront() 중복일 수 있음)
        // 하지만 명시적으로 호출하거나 object:added 이벤트에서 처리
    });

    fontFamilySelect.addEventListener('change', (e) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.isType('i-text') || activeObject.isType('textbox')) && !textToolsContainer.classList.contains('disabled')) {
            activeObject.set('fontFamily', e.target.value); canvas.requestRenderAll();
        }
    });
    fontSizeInput.addEventListener('input', (e) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.isType('i-text') || activeObject.isType('textbox')) && !textToolsContainer.classList.contains('disabled')) {
            const newSize = parseInt(e.target.value, 10);
            if (newSize > 0) { activeObject.set('fontSize', newSize); canvas.requestRenderAll(); }
        }
    });
    textColorInput.addEventListener('input', (e) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.isType('i-text') || activeObject.isType('textbox')) && !textToolsContainer.classList.contains('disabled')) {
            activeObject.set('fill', e.target.value); canvas.requestRenderAll();
        }
    });
    textInput.addEventListener('input', (e) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.isType('i-text') || activeObject.isType('textbox')) && !textToolsContainer.classList.contains('disabled')) {
            if (!activeObject.isEditing) { activeObject.set('text', e.target.value); canvas.requestRenderAll(); }
        }
    });

    // 초기 UI 상태
    updateTextToolUI(null);
}