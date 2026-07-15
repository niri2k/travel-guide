// js/map.js
function openMap(url) {
    // 1. 유효성 검사: URL이 없거나 에러가 나는 기본값이면 경고
    if (!url || url.includes("goo.gl/maps/...")) {
        alert("지도 정보가 등록되지 않았습니다.");
        return;
    }

    // 2. window.open에 "_blank"를 사용하여 
    // 브라우저가 Firebase Dynamic Link로 인식하지 못하도록 별도 프로세스로 실행
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    
    // 만약 팝업 차단 등으로 열리지 않는 경우 대응
    if (!newWindow) {
        alert("팝업이 차단되었습니다. 설정을 확인해 주세요.");
    }
}
