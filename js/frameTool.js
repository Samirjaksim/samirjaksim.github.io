// js/frameTool.js
import { canvas } from './canvasSetup.js';
import { setVolatileState, saveCanvasState } from './historyHandler.js'; // 히스토리 제어 함수
import { setActiveDrawingTool, getActiveDrawingTool } from './toolStateManager.js'; // 전역 도구 상태 관리

// DOM 요소 참조
const addRectFrameButton = document.getElementById('add-rect-frame-button');
const startPolygonFrameButton = document.getElementById('start-polygon-frame-button');
const finishPolygonFrameButton = document.getElementById('finish-polygon-frame-button');

// 다각형 그리기를 위한 상태 변수
let polygonPoints = [];           // 사용자가 찍은 폴리곤 점들의 좌표 배열
let isDrawingPolygon = false;     // 현재 다각형 그리기 모드 활성화 여부
let tempLine = null;              // 마지막으로 찍은 점에서 마우스 커서까지 이어지는 임시 미리보기 선
let tempPointsCircle = [];        // 사용자가 찍은 점들을 시각적으로 표시하는 원 객체 배열
let tempPolylineSegments = [];    // 사용자가 찍은 점들을 순서대로 이어 보여주는 임시 선분 객체 배열

// 임시로 찍은 점(원)에 적용할 스타일
const pointCircleStyle = {
    radius: 5,
    fill: 'rgba(100, 100, 255, 0.7)',
    stroke: 'rgba(0,0,255,0.7)',
    strokeWidth: 1,
    selectable: false,
    hasControls: false,
    hasBorders: false,
    evented: false,         // 마우스 이벤트 받지 않음
    isTemporary: true,      // 임시 객체임을 나타내는 플래그 (레이어 목록/히스토리 제외용)
    originX: 'center',
    originY: 'center'
};

// ESC 키 이벤트 리스너 참조 (해제를 위해)
let handleEscKeyForPolygonInstance = null;

/**
 * 다각형 그리기에 사용된 모든 임시 시각적 요소들을 캔버스에서 제거하고 관련 배열을 초기화합니다.
 */
function clearTemporaryDrawingElements() {
    if (tempLine) {
        canvas.remove(tempLine);
        tempLine = null;
    }
    tempPointsCircle.forEach(circle => canvas.remove(circle));
    tempPointsCircle = [];
    tempPolylineSegments.forEach(segment => canvas.remove(segment));
    tempPolylineSegments = [];
    // polygonPoints 배열은 그리기 시작 시, 또는 완료/취소 시 명시적으로 초기화합니다.
}

/**
 * 다각형 그리기를 완료하고 최종 폴리곤 객체를 캔버스에 추가합니다.
 */
function completePolygonDrawing() {
    setVolatileState(false); // 중요한 상태 변경 구간으로 진입 (또는 휘발성 상태 종료)

    if (polygonPoints.length < 2) {
        alert("최소 2개 이상의 점을 찍어야 선을 그릴 수 있습니다.");
        cancelPolygonDrawing(true); // 실패 시, 전역 도구 상태까지 리셋하며 취소
        return;
    }

    const finalPolygonPoints = [...polygonPoints]; // 현재까지 찍힌 점들로 폴리곤 생성

    // 최종 폴리곤 생성 전에 모든 임시 '캔버스 객체'들만 제거
    if (tempLine) canvas.remove(tempLine); tempLine = null;
    tempPointsCircle.forEach(circle => canvas.remove(circle)); tempPointsCircle = [];
    tempPolylineSegments.forEach(segment => canvas.remove(segment)); tempPolylineSegments = [];

    const polygonFrame = new fabric.Polygon(finalPolygonPoints, {
        fill: 'rgba(0,0,0,0)', // 프레임 내부는 투명
        stroke: 'black',
        strokeWidth: 3,
        id: 'poly_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        customName: '선',
        // isTemporary: false, // 최종 객체이므로 이 플래그는 없음 (기본값)
    });

    canvas.add(polygonFrame); // 이 호출로 main.js의 'object:added' 이벤트가 발생하여
                            // 레이어 목록 추가, 히스토리 저장 등이 처리됨.
    canvas.setActiveObject(polygonFrame); // 새로 추가된 프레임 선택

    // 그리기 모드 정상 종료를 위한 정리 작업
    polygonPoints = []; // 점 목록 초기화
    isDrawingPolygon = false; // 그리기 모드 플래그 해제
    // finishPolygonFrameButton.style.display = 'none'; // toolStateManager가 버튼 display 제어
    canvas.defaultCursor = 'default';
    setActiveDrawingTool(null); // 전역 그리기 도구 상태 해제 (버튼 UI 업데이트 유발)

    // 사용된 모든 이벤트 리스너 해제
    canvas.off('mouse:down', handlePolygonMouseDown);
    canvas.off('mouse:move', handlePolygonMouseMove);
    canvas.off('mouse:dblclick', handlePolygonDoubleClick);
    if (handleEscKeyForPolygonInstance) {
        document.removeEventListener('keydown', handleEscKeyForPolygonInstance);
        handleEscKeyForPolygonInstance = null;
    }
    // console.log('Polygon frame created:', polygonFrame.id);
}

/**
 * 다각형 그리기를 취소하고 모든 관련 상태와 임시 요소들을 정리합니다.
 * @param {boolean} resetGlobalToolState - 전역 도구 상태(activeDrawingTool)도 리셋할지 여부
 */
function cancelPolygonDrawing(resetGlobalToolState = true) {
    setVolatileState(false); // 휘발성 상태 해제 (어떤 경우든)
    clearTemporaryDrawingElements(); // 모든 임시 시각적 요소 제거
    polygonPoints = [];          // 점 목록 확실히 초기화
    isDrawingPolygon = false;    // 그리기 모드 플래그 해제

    // finishPolygonFrameButton.style.display = 'none'; // toolStateManager가 버튼 display 제어
    canvas.defaultCursor = 'default'; // 커서 기본값으로 복원
    
    // 등록된 캔버스 이벤트 리스너 해제
    canvas.off('mouse:down', handlePolygonMouseDown);
    canvas.off('mouse:move', handlePolygonMouseMove);
    canvas.off('mouse:dblclick', handlePolygonDoubleClick);
    // 등록된 ESC 키 이벤트 리스너 해제
    if (handleEscKeyForPolygonInstance) {
        document.removeEventListener('keydown', handleEscKeyForPolygonInstance);
        handleEscKeyForPolygonInstance = null;
    }
    
    if (resetGlobalToolState) {
        setActiveDrawingTool(null); // 전역 그리기 도구 상태 해제 (버튼 UI 업데이트 유발)
    } else {
        // 전역 상태 변경 없이 내부 UI만 정리해야 할 경우 (현재는 이 경우가 없음)
        // toolStateManager.updateAllToolButtonsState(); // 강제로 버튼 상태만 업데이트
    }
    // console.log('Polygon drawing cancelled.');
}

/**
 * 다각형 그리기 모드 중 마우스 다운 이벤트 핸들러 (점 찍기)
 */
function handlePolygonMouseDown(options) {
    if (!isDrawingPolygon) return;
    const pointer = canvas.getPointer(options.e);
    polygonPoints.push({ x: pointer.x, y: pointer.y });

    // 찍은 점 시각화 (isTemporary: true 스타일 객체 사용)
    const pointCircle = new fabric.Circle({ ...pointCircleStyle, left: pointer.x, top: pointer.y });
    canvas.add(pointCircle); // main.js의 object:added에서 isTemporary 플래그로 필터링됨
    tempPointsCircle.push(pointCircle);

    // 이전 점과 현재 점을 잇는 임시 선분 추가
    if (polygonPoints.length > 1) {
        const prevPoint = polygonPoints[polygonPoints.length - 2];
        const segmentLine = new fabric.Line(
            [prevPoint.x, prevPoint.y, pointer.x, pointer.y],
            { stroke: 'rgba(0,0,0,0.3)', strokeWidth: 2, selectable: false, evented: false, isTemporary: true }
        );
        canvas.add(segmentLine); // main.js의 object:added에서 필터링됨
        tempPolylineSegments.push(segmentLine);
    }
    canvas.renderAll();
}

/**
 * 다각형 그리기 모드 중 마우스 이동 이벤트 핸들러 (미리보기 선)
 */
function handlePolygonMouseMove(options) {
    if (!isDrawingPolygon || polygonPoints.length === 0) return;
    const pointer = canvas.getPointer(options.e);
    const lastPoint = polygonPoints[polygonPoints.length - 1];

    if (tempLine) canvas.remove(tempLine); // 이전 미리보기 선 제거
    tempLine = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
        stroke: 'rgba(0,0,255,0.5)', strokeDashArray: [5, 5], strokeWidth: 1,
        selectable: false, evented: false, isTemporary: true
    });
    canvas.add(tempLine); // main.js의 object:added에서 필터링됨
    canvas.renderAll();
}

/**
 * 다각형 그리기 모드 중 더블클릭 이벤트 핸들러 (그리기 완료)
 */
function handlePolygonDoubleClick(options) {
    if (isDrawingPolygon) {
        completePolygonDrawing();
    }
}

/**
 * 프레임 도구 초기화 함수 (사각형 프레임 추가, 다각형 프레임 그리기 시작/완료)
 */
export function initializeFrameTool() {
    // 사각형 프레임 추가 버튼 이벤트 리스너
    if (addRectFrameButton) {
        addRectFrameButton.addEventListener('click', () => {
            if (getActiveDrawingTool() !== null) { // 다른 그리기 작업 중인지 확인
                alert("다른 그리기 작업을 먼저 완료하거나 취소해주세요.");
                return;
            }
            const frame = new fabric.Rect({
                left: 100, top: 100, width: 250, height: 180,
                fill: 'rgba(0,0,0,0)', stroke: 'black', strokeWidth: 3,
                id: 'rect_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                customName: '사각형 프레임'
            });
            canvas.add(frame); // main.js의 object:added에서 레이어 추가 및 상태 저장
            canvas.setActiveObject(frame);
        });
    }

    // 다각형 프레임 그리기 시작 버튼 이벤트 리스너
    if (startPolygonFrameButton) {
        startPolygonFrameButton.addEventListener('click', () => {
            // 이미 다각형을 그리고 있거나, 다른 그리기 도구가 활성화 중이면 시작 안 함
            if (isDrawingPolygon || getActiveDrawingTool() !== null) {
                return;
            }
            canvas.discardActiveObject().renderAll(); // 다른 선택 해제

            setVolatileState(true); // 다각형 그리기 중간 과정은 히스토리 저장 안 함
            isDrawingPolygon = true;
            polygonPoints = []; // 새 그리기를 위해 점 목록 초기화
            clearTemporaryDrawingElements(); // 이전 임시 요소들 확실히 제거

            // finishPolygonFrameButton.style.display = 'inline-block'; // toolStateManager가 처리
            canvas.defaultCursor = 'crosshair';
            setActiveDrawingTool('polygon'); // 전역 도구 상태를 'polygon'으로 (버튼 UI 업데이트 유발)

            // 캔버스 이벤트 리스너 등록
            canvas.on('mouse:down', handlePolygonMouseDown);
            canvas.on('mouse:move', handlePolygonMouseMove);
            canvas.on('mouse:dblclick', handlePolygonDoubleClick);

            // ESC 키 취소 핸들러 등록
            handleEscKeyForPolygonInstance = (e) => {
                if (e.key === 'Escape' && isDrawingPolygon) {
                    cancelPolygonDrawing(true); // ESC로 취소 시 전역 도구 상태도 리셋
                }
            };
            document.addEventListener('keydown', handleEscKeyForPolygonInstance);
        });
    }

    // 다각형 그리기 완료 버튼 이벤트 리스너
    if (finishPolygonFrameButton) {
        finishPolygonFrameButton.addEventListener('click', () => {
            if (isDrawingPolygon) {
                completePolygonDrawing();
            }
        });
    }
}