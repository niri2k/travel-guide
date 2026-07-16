let currentTrip = "";
let currentCurrency = "";
let tripStartDate = ""; 
let tripDaysMap = {}; 
let currentTripData = null;

// 1. [핵심 수정] 여행 목록 로드 (로그인 검증 및 내 데이터만 필터링)
function loadTrips() {
  const tripList = document.getElementById("tripList");
  if (!tripList) return;

  // Firebase 로그인 상태 감지
  firebase.auth().onAuthStateChanged(async (user) => {
    // [로그아웃 상태] 데이터를 절대 불러오지 않고 자물쇠 화면 표시
    if (!user) {
      tripList.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; margin: 10px 0;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔒</div>
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 18px;">로그인이 필요한 서비스입니다</h3>
          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
            우측 상단의 <strong>[로그인]</strong> 버튼을 눌러<br>나만의 실시간 여행 가이드북을 확인하세요!
          </p>
        </div>
      `;
      return;
    }

    // [로그인 상태] 본인의 데이터만 안전하게 호출
    tripList.innerHTML = "<p style='text-align:center; color:#64748b; padding:20px;'>여행 목록을 불러오는 중...</p>";

    try {
      // 본인 계정(uid)과 일치하는 여행 데이터만 가져오도록 필터링 (.where 추가)
      const snapshot = await firebase.firestore().collection("trips")
        .where("uid", "==", user.uid)
        .get();
      
      if (snapshot.empty) {
        tripList.innerHTML = '<p style="text-align:center; padding:30px; color:#64748b; background:#f8fafc; border-radius:12px;">아직 등록된 여행이 없습니다.<br>우측 하단 ＋ 버튼을 눌러 새 여행을 만들어보세요!</p>';
        return;
      }

      // 여행 목록 렌더링
      let html = "<ul style='list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px;'>";
      snapshot.forEach(doc => {
        const data = doc.data();
        html += `
          <li style="cursor:pointer; padding:16px; background:#fff; border:1px solid #e2e8f0; border-radius:14px; box-shadow:0 2px 4px rgba(0,0,0,0.03); display:flex; justify-content:space-between; align-items:center; transition: all 0.2s;" onclick="openTrip('${doc.id}')">
            <div>
              <div style="font-size:17px; font-weight:bold; color:#1e293b; margin-bottom:4px;">✈️ ${data.title}</div>
              <div style="font-size:13px; color:#64748b;">📅 ${data.startDate || '날짜 미정'} 출발</div>
            </div>
            <span style="font-size:13px; font-weight:bold; color:#2563eb; background:#eff6ff; padding:6px 12px; border-radius:8px; border:1px solid #bfdbfe;">상세보기 〉</span>
          </li>
        `;
      });
      html += "</ul>";
      tripList.innerHTML = html;

    } catch (err) {
      console.error("여행 목록 로드 실패:", err);
      tripList.innerHTML = "<p style='color:#ef4444; text-align:center; padding:20px;'>여행 목록을 불러올 수 없습니다.<br>네트워크 상태나 보안 규칙을 확인해 주세요.</p>";
    }
  });
}

// 2. 특정 여행 상세 보기
async function openTrip(tripId) {
  currentTrip = tripId;
  try {
    const doc = await firebase.firestore().collection("trips").doc(tripId).get();
    if (!doc.exists) return;
    
    const data = doc.data();
    currentTripData = data; 
    
    document.getElementById("tripDetail").classList.remove("hidden");
    const placeSection = document.getElementById("placeDetailSection");
    if (placeSection) placeSection.classList.add("hidden");
    window.scrollTo(0, 0);

    document.getElementById("tripTitle").innerHTML = data.title;
    currentCurrency = data.currency || "CNY";
    tripStartDate = data.startDate || "2026-01-01"; 

    let html = "";
    tripDaysMap = {};

    if (data.days && Array.isArray(data.days)) {
      data.days.forEach((day, dayIdx) => {
        let dateObj = new Date(tripStartDate);
        dateObj.setDate(dateObj.getDate() + (day.day - 1));
        let dateStr = dateObj.toISOString().substring(0, 10);

        tripDaysMap[dateStr] = day.day;

        html += `
          <div class="day" id="day-section-${dateStr}" style="margin-bottom: 25px;">
            <h3 style="border-left: 4px solid #2563eb; padding-left: 10px; margin-bottom: 12px; color:#1e293b;">
              DAY ${day.day} <span style="font-size:14px; font-weight:normal; color:#64748b;">(${dateStr})</span><br>
              <span style="font-size:16px; color:#334155;">${day.title}</span>
            </h3>
            <div class="places-list" style="display:flex; flex-direction:column; gap:10px;">
        `;

        if (day.places && Array.isArray(day.places)) {
          day.places.forEach((place, placeIdx) => {
            const nameKr = place.name_kr || place.name || "이름 없음";
            const nameCn = place.name_cn || "";
            const nameEn = place.name_en || "";
            const cost = place.cost || 0;
            const safeMapUrl = place.mapUrl || place.map || "";

            html += `
              <div class="place" style="border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <h4 onclick="openPlaceDetailByIndex(${dayIdx}, ${placeIdx})" style="margin: 0; color: #2563eb; cursor: pointer; font-size: 16px; display: flex; flex-direction: column; gap: 2px;">
                    <span>📍 ${nameKr} <span style="font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe; margin-left: 4px;">상세보기 〉</span></span>
                    ${nameCn ? `<span style="font-size: 13px; color: #64748b; font-weight: normal;">${nameCn} ${nameEn ? `(${nameEn})` : ''}</span>` : ''}
                  </h4>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #f1f5f9;">
                  <span style="font-size: 14px; color: #475569; font-weight: 500;">💰 예상 비용 : <strong style="color:#1e293b;">${cost} ${currentCurrency}</strong></span>
                  ${safeMapUrl ? `<button class="map-btn" data-url="${safeMapUrl}" style="padding: 6px 12px; font-size: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #334155; font-weight: bold; cursor: pointer;">🗺️ 지도 보기</button>` : ''}
                </div>
              </div>
            `;
          });
        }

        html += `</div> 
                 <div id="day-expenses-${dateStr}" class="day-expenses-container"></div>
                 <div id="day-total-${dateStr}" class="day-total-box hidden"></div>
           </div>`;
      });
    }

    document.getElementById("schedule").innerHTML = html;
    
    if (typeof loadExpenses === "function") loadExpenses();
    if (typeof loadReviews === "function") loadReviews();
  } catch (err) {
    console.error("여행 데이터 로드 실패:", err);
  }
}

// 페이지가 로드되면 목록 불러오기 실행
document.addEventListener("DOMContentLoaded", loadTrips);
