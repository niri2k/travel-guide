// ==========================================
// 스마트 지도 보기 기능 (js/map.js)
// ==========================================
function openMap(url, placeName) {
  // 1. 링크가 아예 없거나, 임시 테스트 링크인 경우 -> 장소 이름으로 구글 지도 자동 검색!
  if (!url || url === "undefined" || url.includes("googleusercontent.com")) {
    if (placeName) {
      const encodedName = encodeURIComponent(placeName);
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
      window.open(searchUrl, '_blank');
    } else {
      alert("등록된 장소 이름이나 지도 링크가 없습니다.");
    }
    return;
  }

  // 2. 정상적인 지도 링크가 있다면 해당 링크로 새 창 열기
  window.open(url, '_blank');
}
