let currentTrip = "";
let currentCurrency = "";
let tripStartDate = ""; 
let tripDaysMap = {}; 

// 1. 여행 목록 로드
async function loadTrips() {
  const tripList = document.getElementById("tripList");
  if (!tripList) return;
  tripList.innerHTML = "불러오는 중...";

  try {
    const snapshot = await firebase.firestore().collection("trips").get();
    ㅁlet currentTrip = "";
let currentCurrency = "";
let tripStartDate = ""; 
let tripDaysMap = {}; 
let currentTripData = null; // 상세 페이지에서 참조할 수 있도록 전역에 저장

// 1. 여행 목록 로드 (Firestore 사용)
async function loadTrips() {
  const tripList = document.getElementById("tripList");
  if (!tripList) return;
  tripList.innerHTML = "불러오는 중...";

  try {
    const snapshot = await firebase.firestore().collection("trips").get();
    
    if (snapshot.empty) {
      tripList.innerHTML = '<p style="text-align:center; padding:20px;">아직 등록된 여행이 없습니다.</p>';
      return;
    }

    let html = "<ul style='list-style:none; padding:0; margin:0;'>";
    snapshot.forEach(doc => {
      const data = doc.data();
      html += `<li style="cursor:pointer; padding:15px; border-bottom:1px solid #eee; font-size:16px; font-weight:bold; color:#1e293b; display:flex; justify-content:space-between; align-items:center;" onclick="openTrip('${doc.id}')">
                <span>✈️ ${data.title}</span>
                <span style="font-size:13px; color:#64748b; font-weight:normal;">${data.startDate || '날짜 미정'} 〉</span>
               </li>`;
    });
    html += "</ul>";
    tripList.innerHTML = html;
  } catch (err) {
    console.error("여행 목록 로드 실패:", err);
    tripList.innerHTML = "여행 목록을 불러올 수 없습니다.";
  }
}

// 2. 특정 여행 상세 보기 (Firestore 사용)
async function openTrip(tripId) {
  currentTrip = tripId;
  try {
    const doc = await firebase.firestore().collection("trips").doc(tripId).get();
    if (!doc.exists) return;
    
    const data = doc.data();
    currentTripData = data; // 전역 저장 (상세 페이지에서 사용)
    
    // 화면 전환
    document.getElementById("tripDetail").classList.remove("hidden");
    const placeSection = document.getElementById("placeDetailSection");
    if (placeSection) placeSection.classList.add("hidden");

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
            // 다국어 필드 호환성 처리
            const nameKr = place.name_kr || place.name || "이름 없음";
            const nameCn = place.name_cn || "";
            const nameEn = place.name_en || "";
            const cost = place.cost || 0;
            const safeMapUrl = place.mapUrl || place.map || "";

            html += `
              <div class="place" style="border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">
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

document.addEventListener("DOMContentLoaded", loadTrips);
    if (snapshot.empty) {
      tripList.innerHTML = '<p style="text-align:center; padding:20px;">아직 등록된 여행이 없습니다.</p>';
      return;
    }

    let html = "<ul>";
    snapshot.forEach(doc => {
      const data = doc.data();
      html += `<li style="cursor:pointer; padding:10px; border-bottom:1px solid #eee;" onclick="openTrip('${doc.id}')">
                ✈️ ${data.title} (${data.startDate || '날짜 미정'})
               </li>`;
    });
    html += "</ul>";
    tripList.innerHTML = html;
  } catch (err) {
    console.error("여행 목록 로드 실패:", err);
    tripList.innerHTML = "여행 목록을 불러올 수 없습니다.";
  }
}

// 2. 특정 여행 상세 보기
async function openTrip(tripId) {
  currentTrip = tripId;
  try {
    const doc = await firebase.firestore().collection("trips").doc(tripId).get();
    if (!doc.exists) return;
    
    const data = doc.data();
    document.getElementById("tripDetail").classList.remove("hidden");
    document.getElementById("tripTitle").innerHTML = data.title;
    currentCurrency = data.currency;
    tripStartDate = data.startDate || "2026-01-01"; 

    let html = "";
    tripDaysMap = {};

    if (data.days && Array.isArray(data.days)) {
      data.days.forEach((day) => {
        let dateObj = new Date(tripStartDate);
        dateObj.setDate(dateObj.getDate() + (day.day - 1));
        let dateStr = dateObj.toISOString().substring(0, 10);

        tripDaysMap[dateStr] = day.day;

        html += `
          <div class="day" id="day-section-${dateStr}">
            <h3>DAY ${day.day} <span style="font-size:16px; font-weight:normal; color:#64748b;">(${dateStr})</span><br>${day.title}</h3>
            <div class="places-list">
        `;

        if (day.places) {
          day.places.forEach((place) => {
            let safeMapUrl = place.map ? place.map.replace(/'/g, "%27") : "";
            // 버튼에 onclick 대신 data 속성을 부여하여 Firebase의 링크 간섭을 차단
            html += `
              <div class="place">
                <h4>📍 ${place.name}</h4>
                <p>💰 예상 비용 : ${place.cost} ${data.currency}</p>
                <button class="map-btn" data-url="${safeMapUrl}">🗺️ 지도 보기</button>
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

document.addEventListener("DOMContentLoaded", loadTrips);
