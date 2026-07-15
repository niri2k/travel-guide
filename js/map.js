// js/map.js 수정본
function openMap(url) {
    if (!url || url === "https://goo.gl/maps/...") {
        alert("지도 정보가 등록되지 않았습니다.");
        return;
    }
    
    // Firebase가 Dynamic Link로 간섭하지 못하게 
    // window.open을 사용하여 새 창으로 직접 열기
    window.open(url, "_blank");
}
