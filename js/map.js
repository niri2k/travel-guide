// js/map.js
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('map-btn')) {
        const url = e.target.getAttribute('data-url');
        
        // 1. 혹시라도 잘못된(Firebase 간섭용) 주소라면 구글 지도 검색창으로 보냄
        if (!url || url.includes("googleusercontent.com")) {
            const placeName = e.target.getAttribute('data-name');
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`, "_blank", "noopener");
        } else {
            // 2. 정상 주소라면 바로 오픈
            window.open(url, "_blank", "noopener");
        }
    }
});
