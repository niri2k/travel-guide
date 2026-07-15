// js/map.js
// document 전체에서 map-btn 클래스를 가진 버튼 클릭을 감지합니다.
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('map-btn')) {
        const url = e.target.getAttribute('data-url');
        
        if (!url || url.length < 5 || url.includes("goo.gl/maps/...")) {
            alert("지도 정보가 올바르게 등록되지 않았습니다.");
            return;
        }
        
        // 보안 옵션을 넣어서 Firebase가 가로채지 못하게 함
        window.open(url, "_blank", "noopener,noreferrer");
    }
});
