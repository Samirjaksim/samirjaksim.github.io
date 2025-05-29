// js/frameTool.js
import { canvas } from './canvasSetup.js';
import { bringAllTextToFront } from './utils.js';

const addRectFrameButton = document.getElementById('add-rect-frame-button');
const startPolygonFrameButton = document.getElementById('start-polygon-frame-button');
const finishPolygonFrameButton = document.getElementById('finish-polygon-frame-button');

let polygonPoints = []; // 현재 그려지고 있는 폴리곤의 점들을 저장하는 배열
let isDrawingPolygon = false; // 다각형 그리기 모드 플래그
let tempLine = null; // 다음 점으로 이어지는 임시 선 (미리보기용)
let tempPointsCircle = []; // 찍은 점들을 표시할 작은 원들

// 임시로 찍은 점들을 시각적으로 표시하는 원 스타일
const pointCircleStyle = {
    radius: 5,
    fill: 'rgba(100, 100, 255, 0.7)',
    stroke: 'rgba(0,0,255,0.7)',
    strokeWidth: 1,
    selectable: false,
    hasControls: false,
    hasBorders: false,
    evented: false, // 이벤트 받지 않도록
    originX: 'center',
    originY: 'center'
};

function clearTemporaryPolygonElements() {
    if (tempLine) {
        canvas.remove(tempLine);
        tempLine = null;
    }
    tempPointsCircle.forEach(circle => canvas.remove(circle));
    tempPointsCircle = [];
    polygonPoints = []; // 점 목록도 초기화
}

function finishDrawingPolygon() {
    if (polygonPoints.length < 3) {
        alert("최소 3개 이상의 점을 찍어야 다각형을 만들 수 있습니다.");
        clearTemporaryPolygonElements(); // 임시 요소들 정리
        isDrawingPolygon = false;
        startPolygonFrameButton.style.display = 'inline-block';
        finishPolygonFrameButton.style.display = 'none';
        canvas.defaultCursor = 'default';
        canvas.off('mouse:down', handlePolygonMouseDown); // 이벤트 리스너 해제
        canvas.off('mouse:move', handlePolygonMouseMove);
        canvas.off('mouse:dblclick', handlePolygonDoubleClick);
        return;
    }

    const polygonFrame = new fabric.Polygon(polygonPoints, {
        fill: 'rgba(0,0,0,0)',
        stroke: 'black',
        strokeWidth: 3,
        // objectCaching: false, // 폴리곤 편집 시 성능 문제 있으면 고려
    });

    canvas.add(polygonFrame);
    canvas.setActiveObject(polygonFrame);
    bringAllTextToFront();

    // 그리기 모드 종료 및 정리
    clearTemporaryPolygonElements();
    isDrawingPolygon = false;
    startPolygonFrameButton.style.display = 'inline-block';
    finishPolygonFrameButton.style.display = 'none';
    canvas.defaultCursor = 'default';

    // 이벤트 리스너 해제
    canvas.off('mouse:down', handlePolygonMouseDown);
    canvas.off('mouse:move', handlePolygonMouseMove);
    canvas.off('mouse:dblclick', handlePolygonDoubleClick);
    console.log('Polygon frame created:', polygonFrame);
}

function handlePolygonMouseDown(options) {
    if (!isDrawingPolygon) return;

    const pointer = canvas.getPointer(options.e);
    polygonPoints.push({ x: pointer.x, y: pointer.y });

    // 찍은 점 시각적으로 표시
    const pointCircle = new fabric.Circle({
        ...pointCircleStyle,
        left: pointer.x,
        top: pointer.y,
    });
    canvas.add(pointCircle);
    tempPointsCircle.push(pointCircle);

    // 임시 선 업데이트 (첫 점 이후부터)
    if (polygonPoints.length > 1) {
        if (tempLine) canvas.remove(tempLine); // 이전 임시선 제거
        // 이전 점에서 현재 점까지의 선을 그림 (실제 폴리곤의 일부가 될 선)
        const line = new fabric.Line(
            [
                polygonPoints[polygonPoints.length - 2].x, polygonPoints[polygonPoints.length - 2].y,
                pointer.x, pointer.y
            ], {
            stroke: 'rgba(0, 0, 0, 0.5)', // 임시 선 스타일
            strokeWidth: 2,
            selectable: false, evented: false,
        });
        // canvas.add(line); // 이 선은 최종 폴리곤에 포함되므로 미리 추가할 필요 없음
                            // 대신, mouse:move에서 마지막 점과 커서 사이의 선을 tempLine으로 그림
    }
    console.log('Points:', polygonPoints);
    canvas.renderAll();
}

function handlePolygonMouseMove(options) {
    if (!isDrawingPolygon || polygonPoints.length === 0) return;

    const pointer = canvas.getPointer(options.e);
    const lastPoint = polygonPoints[polygonPoints.length - 1];

    if (tempLine) {
        canvas.remove(tempLine);
    }
    // 마지막으로 찍은 점에서 현재 마우스 커서 위치까지 임시 선 그리기
    tempLine = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
        stroke: 'rgba(0,0,255,0.5)', // 마우스 따라다니는 임시 선 스타일
        strokeDashArray: [5, 5], // 점선
        strokeWidth: 1,
        selectable: false,
        evented: false,
    });
    canvas.add(tempLine);
    canvas.renderAll();
}

function handlePolygonDoubleClick(options) {
    if (isDrawingPolygon) {
        finishDrawingPolygon();
    }
}

export function initializeFrameTool() {
    if (addRectFrameButton) {
        addRectFrameButton.addEventListener('click', () => {
            const frame = new fabric.Rect({
                left: 100,
                top: 100,
                width: 250,
                height: 180,
                fill: 'rgba(0,0,0,0)',
                stroke: 'black',
                strokeWidth: 3,
            });
            canvas.add(frame);
            canvas.setActiveObject(frame);
            bringAllTextToFront();
        });
    }

 // 다각형 프레임 그리기 시작
    if (startPolygonFrameButton) {
        startPolygonFrameButton.addEventListener('click', () => {
            if (isDrawingPolygon) { // 이미 그리기 모드일 경우
                // 그리기를 취소하는 로직으로 변경하거나, 메시지만 표시
                console.log("Already in polygon drawing mode. Click 'Finish Drawing Polygon' or double-click to complete.");
                return;
            }
            isDrawingPolygon = true;
            polygonPoints = []; // 점 목록 초기화
            clearTemporaryPolygonElements(); // 혹시 모를 이전 임시 요소 제거

            startPolygonFrameButton.style.display = 'none';
            finishPolygonFrameButton.style.display = 'inline-block';
            canvas.defaultCursor = 'crosshair'; // 커서 모양 변경

            // 이벤트 리스너 등록
            canvas.on('mouse:down', handlePolygonMouseDown);
            canvas.on('mouse:move', handlePolygonMouseMove);
            canvas.on('mouse:dblclick', handlePolygonDoubleClick); // 더블클릭으로 완성

            console.log("Polygon drawing mode started. Click on canvas to add points.");
        });
    }

    // 다각형 그리기 완료 버튼
    if (finishPolygonFrameButton) {
        finishPolygonFrameButton.addEventListener('click', () => {
            if (isDrawingPolygon) {
                finishDrawingPolygon();
            }
        });
    }
}