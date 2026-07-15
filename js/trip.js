let currentTrip = "";
let currentCurrency = "";
let tripStartDate = ""; 
let tripDaysMap = {}; 

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

// 2. 특정 여행 상세 보기 (Firestore 사용)
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
            let safeName = place.name ? place.name.replace(/'/g, "\\'") : "";
            html += `
              <div class="place">
                <h4>📍 ${place.name}</h4>
                <p>💰 예상 비용 : ${place.cost} ${data.currency}</p>
                <button onclick="openMap('${safeMapUrl}', '${safeName}')">🗺️ 지도 보기</button>
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
    
    // 비용 및 후기 로드
    if (typeof loadExpenses === "function") loadExpenses();
    if (typeof loadReviews === "function") loadReviews();
  } catch (err) {
    console.error("여행 데이터 로드 실패:", err);
  }
}

// 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", loadTrips);
