// js/layerEditor.js
import { canvas } from './canvasSetup.js';

const layerListUl = document.getElementById('layer-list');

// 캔버스 객체에 고유 ID를 부여하는 함수 (간단한 예시)
function generateObjectId() {
    return 'obj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// getObjectTypeIcon, getObjectName 함수 정의 (기존과 동일)
function getObjectTypeIcon(object) {
    if(!object) return '❓';
    if (object.isType('image')) return '🖼️';
    if (object.isType('i-text') || object.isType('textbox')) return '📝';
    if (object.isType('rect') && object.stroke) return '⬜'; // 테두리 있는 사각형 (프레임)
    if (object.isType('polygon') && object.stroke) return '💠'; // 테두리 있는 다각형 (프레임)
    if (object.isType('rect') && !object.stroke && object.fill && object.fill !== 'rgba(0,0,0,0)') return '🟩'; // 채워진 사각형
    return '●'; // 기타 기본 도형
}

function getObjectName(object) {
    if(!object) return '객체';
    if (object.isType('image')) return '이미지';
    if (object.isType('i-text') || object.isType('textbox')) return '텍스트'
    if (object.isType('rect') && object.stroke) return '사각 프레임';
    if (object.isType('polygon') && object.stroke) return '프레임';
    if (object.isType('rect') && !object.stroke && object.fill && object.fill !== 'rgba(0,0,0,0)') return '채워진 사각형';
    return object.type ? object.type.charAt(0).toUpperCase() + object.type.slice(1) : '객체';
}


// 레이어 목록 아이템 클릭 시 해당 캔버스 객체 선택
function handleLayerItemClick(event) {

    if (event.target.tagName === 'INPUT' && event.target.classList.contains('layer-name-input')) {
        return;
    }

    const listItem = event.currentTarget;
    const objectId = listItem.dataset.objectId;
    const fabricObject = canvas.getObjects().find(obj => obj.id === objectId);

    if (fabricObject && fabricObject.selectable) { // 선택 가능한 객체일 때만 선택
        canvas.setActiveObject(fabricObject);
        canvas.renderAll();
    } else if (fabricObject && !fabricObject.selectable) {
        // 선택 불가능한 객체 클릭 시 (예: 잠긴 객체) 알림 또는 아무 동작 안 함
        console.log(`Object ${objectId} is locked and not selectable.`);
    }
    // 선택된 레이어 아이템에 'selected' 클래스 추가 (UI 업데이트)
    // setActiveObject가 object:selected 이벤트를 발생시키므로, 거기서 updateSelectedLayerItem 호출
}


function handleLayerNameDoubleClick(event) {
    const nameSpan = event.currentTarget;
    const listItem = nameSpan.closest('.layer-item');
    const objectId = listItem.dataset.objectId;
    const fabricObject = canvas.getObjects().find(obj => obj.id === objectId);

    if (!fabricObject) return;

    // 기존 input이 있다면 제거 (혹시 모를 중복 방지)
    const existingInput = listItem.querySelector('.layer-name-input');
    if (existingInput) {
        existingInput.remove();
    }

    const currentName = fabricObject.customName || nameSpan.textContent; 
    
    nameSpan.style.display = 'none'; // 원래 이름 숨기기

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentName;
    inputElement.classList.add('layer-name-input'); // 스타일링 및 식별용 클래스
    
    // nameSpan 다음에 input 삽입
    nameSpan.parentNode.insertBefore(inputElement, nameSpan.nextSibling);
    inputElement.focus(); // 바로 입력 가능하도록 포커스
    inputElement.select(); // 전체 텍스트 선택

    function saveName() {
        const newName = inputElement.value.trim();
        if (newName) {
            fabricObject.customName = newName; // 캔버스 객체에 사용자 정의 이름 저장
            nameSpan.textContent = newName; // + ` (ID: ${fabricObject.id.substring(0,6)})`; // 필요시 ID 다시 표시
        } else {
            const defaultObjectName = getObjectName(fabricObject);
            fabricObject.customName = defaultObjectName; // 빈 문자열 대신 기본 이름을 저장할 수도 있음
            nameSpan.textContent = defaultObjectName;
        }
        inputElement.remove(); // 입력 필드 제거
        nameSpan.style.display = ''; // 원래 이름 다시 보이기
        // 이벤트 리스너도 제거해야 중복 등록 방지
        inputElement.removeEventListener('blur', saveNameOnBlur);
        inputElement.removeEventListener('keydown', saveNameOnEnter);
    }
    
    function saveNameOnBlur() {
        saveName();
    }

    function saveNameOnEnter(e) {
        if (e.key === 'Enter') {
            saveName();
        } else if (e.key === 'Escape') { // ESC 누르면 취소
            inputElement.remove();
            nameSpan.style.display = '';
            inputElement.removeEventListener('blur', saveNameOnBlur);
            inputElement.removeEventListener('keydown', saveNameOnEnter);
        }
    }

    inputElement.addEventListener('blur', saveNameOnBlur);
    inputElement.addEventListener('keydown', saveNameOnEnter);
}


// 레이어 가시성 토글 버튼 클릭
function handleVisibilityToggle(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const listItem = button.closest('.layer-item');
    const objectId = listItem.dataset.objectId;
    const fabricObject = canvas.getObjects().find(obj => obj.id === objectId);

    if (fabricObject) {
        fabricObject.set('visible', !fabricObject.visible);
        button.textContent = fabricObject.visible ? '👁️' : '🙈';
        button.classList.toggle('hidden-eye', !fabricObject.visible);
        listItem.style.opacity = fabricObject.visible ? 1 : 0.6;
        canvas.renderAll();
    }
}

// 레이어 잠금 토글
function handleLockToggle(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const listItem = button.closest('.layer-item');
    const objectId = listItem.dataset.objectId;
    const fabricObject = canvas.getObjects().find(obj => obj.id === objectId);

    if (fabricObject) {
        const newSelectableState = !fabricObject.selectable;
        fabricObject.set({
            selectable: newSelectableState,
            evented: newSelectableState // selectable과 동일한 상태로 evented 설정
        });

        button.textContent = fabricObject.selectable ? '🔓' : '🔒';
        button.classList.toggle('locked', !fabricObject.selectable);
        // listItem.style.opacity = fabricObject.selectable ? 1 : 0.7; // 가시성 투명도와 겹칠 수 있으므로 주의

        if (!fabricObject.selectable && canvas.getActiveObject() === fabricObject) {
            canvas.discardActiveObject(); // 잠근 객체가 선택된 상태면 선택 해제
        }
        canvas.renderAll();
        // console.log(`Object ${objectId} selectable: ${fabricObject.selectable}`);
    }
}

// 레이어 편집기에 새 아이템 추가
export function addLayerItem(object) {
   if (!object.id) { // 객체에 ID가 없으면 부여
        object.id = generateObjectId();
    }
    
    if (object.customName === undefined) { // 사용자 정의 이름이 없으면 초기화
        object.customName = ''; // 또는 기본 이름으로 설정
    }

    const listItem = document.createElement('li');
    listItem.classList.add('layer-item');
    listItem.dataset.objectId = object.id;

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('layer-type-icon');
    iconSpan.textContent = getObjectTypeIcon(object);

    const nameSpan = document.createElement('span');
    nameSpan.classList.add('layer-name');
    nameSpan.textContent = getObjectName(object); // ID 표시는 일단 제거 (필요시 다시 추가)

    const displayName = object.customName || getObjectName(object);
    nameSpan.textContent = displayName; // ID 표시는 일단 제거, 필요시 `+ (ID: ...)` 추가
    nameSpan.title = displayName; // 툴팁으로 전체 이름 표시 (길어서 잘릴 경우 대비)
    nameSpan.addEventListener('dblclick', handleLayerNameDoubleClick); // 이름에 더블클릭 이벤트 추가

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('layer-actions');

    const visibilityToggle = document.createElement('button');
    visibilityToggle.classList.add('layer-visible-toggle');
    visibilityToggle.title = "가시성";
    visibilityToggle.textContent = object.visible !== false ? '👁️' : '🙈';
    if (object.visible === false) {
        visibilityToggle.classList.add('hidden-eye');
        listItem.style.opacity = 0.6;
    }

    // --- 자물쇠 버튼 생성 및 설정 ---
    const lockToggle = document.createElement('button'); // <<-- 위치 수정: if 블록 밖으로 이동
    lockToggle.classList.add('layer-lock-toggle');
    lockToggle.title = "잠금";
    lockToggle.textContent = object.selectable !== false ? '🔓' : '🔒';
    if (object.selectable === false) {
        lockToggle.classList.add('locked');
        // 잠금 시 투명도 조절은 가시성 투명도와 충돌할 수 있으므로 CSS에서 .locked 클래스로 제어하거나,
        // 가시성 투명도와 조합되는 방식을 고려해야 함. 여기서는 일단 주석 처리.
        // listItem.style.opacity = 0.7;
    }
    // --- 자물쇠 버튼 설정 끝 ---

    listItem.appendChild(iconSpan);
    listItem.appendChild(nameSpan);
    listItem.appendChild(visibilityToggle);
    listItem.appendChild(lockToggle); // 자물쇠 버튼 DOM에 추가

    // 이벤트 리스너 추가
    listItem.addEventListener('click', handleLayerItemClick);
    visibilityToggle.addEventListener('click', handleVisibilityToggle);
    lockToggle.addEventListener('click', handleLockToggle);

    // 레이어 목록의 맨 위에 아이템 추가 (캔버스 렌더링 순서상 위쪽 객체가 목록의 위쪽에 오도록)
    if (layerListUl.firstChild) {
        layerListUl.insertBefore(listItem, layerListUl.firstChild);
    } else {
        layerListUl.appendChild(listItem);
    }
}

// 레이어 편집기에서 아이템 제거
export function removeLayerItem(objectId) {
    if (!objectId) return;
    const listItem = layerListUl.querySelector(`.layer-item[data-object-id="${objectId}"]`);
    if (listItem) {
        listItem.remove();
    }
}

// 선택된 캔버스 객체에 해당하는 레이어 아이템에 'selected' 클래스 적용
export function updateSelectedLayerItem(activeObjectId) {
    const items = layerListUl.querySelectorAll('.layer-item');
    items.forEach(item => {
        if (item.dataset.objectId === activeObjectId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// 레이어 목록 전체 다시 그리기
export function rerenderLayerList() {
    if (!layerListUl) return;
    layerListUl.innerHTML = ''; // 기존 목록 모두 비우기

    // Fabric.js에서 getObjects()는 렌더링 순서대로 객체를 반환 (0번 인덱스가 가장 아래, 마지막 인덱스가 가장 위)
    // addLayerItem은 목록의 맨 위에 아이템을 추가(insertBefore)하므로,
    // 캔버스 객체 배열을 역순으로 순회해야 캔버스의 시각적 위쪽 객체가 목록의 위쪽에 표시됨.
    const canvasObjects = canvas.getObjects().slice(); // 위쪽 객체부터 처리하기 위해 복사 후 역순

    canvasObjects.forEach(obj => {
        // 그룹 객체 자체를 목록에 표시할지 여부 등 필터링 조건 추가 가능
        if (obj) { // null 체크
            addLayerItem(obj);
        }
    });

    // 현재 활성화된 객체가 있다면, 레이어 목록에서도 선택 표시
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.id) {
        updateSelectedLayerItem(activeObj.id);
    } else {
        updateSelectedLayerItem(null); // 활성 객 없으면 선택 표시도 해제
    }
}