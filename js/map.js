// js/map.js
function openMap(url) {
    if (!url || url.length < 5) {
        alert("지도 정보가 등록되지 않았습니다.");
        return;
    }

    // [핵심] window.open의 두 번째 인자에 "_blank"를 넣고,
    // 세 번째 인자에 'noopener' 옵션을 주면
    // 브라우저는 이를 보안이 강화된 새 탭으로 인식하여
    // Firebase SDK가 Dynamic Link로 가로채는 것을 방지합니다.
    window.open(url, "_blank", "noopener,noreferrer");
}
