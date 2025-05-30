// js/canvasSetup.js
export const canvas = new fabric.Canvas('comic-canvas', {
    backgroundColor: 'white',
    preserveObjectStacking: true
});

// 캔버스 관련 초기 설정이나 헬퍼 함수가 더 필요하다면 여기에 추가 가능
// 예: 캔버스 크기 조절 함수 등