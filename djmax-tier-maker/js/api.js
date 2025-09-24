// js/api.js - API 관련 모든 통신을 담당합니다.

const API_URL = 'https://corsproxy.io/?url=https://v-archive.net/db/songs.json';

export async function fetchAllSongs() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("전체 곡 정보를 불러오는 데 실패했습니다:", error);
        // 에러가 발생하면 빈 배열을 반환하여 다른 기능의 중단을 막습니다.
        return []; 
    }
}