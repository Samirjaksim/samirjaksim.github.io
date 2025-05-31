// js/gameState.js

let currentScore = 0;
let currentLeftCardData = null;
let currentRightCardData = null;
let selectedButtonMode = null; // app.js 또는 gameFlow.js에서 설정
let playedProblems = []; 
let currentPlayerNickname = "익명"; // 게임 시작 전 설정 (app.js에서 처리)
let currentLives = 1; // 기본 목숨 1개
const EASY_MODE_LIVES = 3; // 이지 모드 시 목숨 개수