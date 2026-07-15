// ==========================================
// 스마트 지도 보기 기능 (js/map.js)
// ==========================================
function openMap(url, placeName) {
  // 1. 링크가 아예 없거나, 임시 플레이스홀더 주소인 경우 -> 자동 검색 모드
  if (!url || url === "undefined" || url.includes("googleusercontent.com")) {
    if (placeName) {
      // 중국(시안) 여행을 고려해 구글 맵 검색 결과 창으로 안전하게 띄워줍니다.
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
      window.open(searchUrl, '_blank');
    } else {
      alert("등록된 지도 링크나 장소 이름이 없습니다.");
    }
    return;
  }

  // 2. 정상적인 지도 URL(구글맵, 바이두맵, 고덕지도 등)이 입력되어 있다면 바로 새 창 열기
  window.open(url, '_blank');
}
