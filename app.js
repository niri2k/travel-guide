// ====================================================
// app.js (과거 JSON 로컬 로드 코드 완전 삭제본)
// ====================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Travel Guide App 초기화 완료!");
    
    // 모바일 환경 등에서 폼 제출 시 페이지가 새로고침되는 현상 방지
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    });
});

// 전역 에러 핸들러 (네트워크 끊김 등 비상 상황 감지)
window.addEventListener("unhandledrejection", (event) => {
    console.warn("처리되지 않은 Promise 에러 감지:", event.reason);
});