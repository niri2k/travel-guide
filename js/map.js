// js/map.js
function openMap(url) {
    // 1. 만약 googleusercontent.com 주소라면 강제로 구글 지도 메인으로 보냄 (에러 방지)
    if (url.includes("googleusercontent.com")) {
        console.warn("잘못된 주소 형식 발견, 구글 지도 메인으로 이동합니다.");
        window.open("https://www.google.com/maps", "_blank", "noopener,noreferrer");
        return;
    }

    // 2. 정상적인 주소는 그대로 오픈
    window.open(url, "_blank", "noopener,noreferrer");
}
