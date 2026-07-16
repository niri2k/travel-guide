// ====================================================
// js/trip.js (카테고리 디자인 + 보안 검증 완벽 통합본)
// ====================================================

let currentTrip = "";
let currentCurrency = "";
let tripStartDate = ""; 
let tripDaysMap = {}; 
let currentTripData = null; // 상세 페이지에서 참조할 수 있도록 전역 저장

// 1. 여행 목록 로드 (로그인 검증 + 날짜별 자동 카테고리 분류)
function loadTrips() {
  const tripList = document.getElementById("tripList");
  if (!tripList) return;

  // Firebase 로그인 상태 감지
  firebase.auth().onAuthStateChanged(async (user) => {
    // [로그아웃 상태] 예전 데이터나 목록을 절대 보여주지 않고 자물쇠 화면 표시
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

    // [로그인 상태] 로딩 안내 띄우기
    tripList.innerHTML = "<p style='text-align:center; color:#64748b; padding:30px 0;'>✈️ 내 여행 목록을 불러오는 중...</p>";

    try {
      // 본인 계정(uid)의 데이터만 Firestore에서 안전하게 조회
      const snapshot = await firebase.firestore().collection("trips")
        .where("uid", "==", user.uid)
        .get();
      
      if (snapshot.empty) {
        tripList.innerHTML = `
          <div style="text-align:center; padding: 40px 20px; background: #f8fafc; border-radius: 16px; margin: 10px 0;">
            <p style="color: #64748b; font-size: 15px; margin-bottom: 10px;">아직 등록된 여행이 없습니다.</p>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">우측 하단 ＋ 버튼을 눌러 새 여행을 만들어보세요!</p>
          </div>
        `;
        return;
      }

      // 카테고리 초기화 (마음에 드셨던 UI 구조 적용!)
      let categories = {
        upcoming: { title: "✈️ 다가올 여행", items: [] },
        active:   { title: "🌏 여행 중", items: [] },
        memory:   { title: "📸 여행의 기억", items: [] }
      };

      const today = new Date().toISOString().substring(0, 10); // 오늘 날짜 (YYYY-MM-DD)

      // 날짜를 비교하여 자동으로 카테고리 분류하기
      snapshot.forEach(doc => {
        const data = doc.data();
        data.id = doc.id; // 문서 고유 ID 저장
        
        const start = data.startDate || "2099-01-01";
        // 종료일이 따로 없으면 시작일 기준으로 일주일(7일) 뒤를 종료일로 임시 계산
        let end = data.endDate;
        if (!end && data.startDate) {
          let tempDate = new Date(data.startDate);
          tempDate.setDate(tempDate.getDate() + (data.days ? data.days.length : 7));
          end = tempDate.toISOString().substring(0, 10);
        } else if (!end) {
          end = start;
        }

        // 오늘 날짜와 비교하여 분배
        if (today < start) {
          categories.upcoming.items.push(data);
        } else if (today >= start && today <= end) {
          categories.active.items.push(data);
        } else {
          categories.memory.items.push(data);
        }
      });

      // HTML 화면 렌더링
      let html = "";
      Object.values(categories).forEach(category => {
        html += `<h3 style="margin: 25px 0 12px 0; color: #1e293b; font-size: 18px; display:flex; align-items:center; gap:6px;">${category.title}</h3>`;

        if (category.items.length === 0) {
          html += `<p style="color: #94a3b8; font-size: 14px; margin: 0 0 15px 0; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed #e2e8f0; text-align: center;">등록된 여행이 없습니다.</p>`;
        } else {
          category.items.forEach(trip => {
            html += `
              <div class="trip" onclick="openTrip('${trip.id}')" style="cursor: pointer; padding: 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.03); margin-bottom: 12px; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0 0 6px 0; font-size: 17px; color: #1e293b; font-weight: bold;">${trip.title}</h4>
                  <p style="margin: 0; font-size: 13px; color: #64748b;">📅 ${trip.startDate || '날짜 미정'} ${trip.endDate ? `~ ${trip.endDate}` : ''}</p>
                </div>
                <span style="font-size: 13px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 8px 14px; border-radius: 10px; border: 1px solid #bfdbfe; white-space: nowrap;">상세보기 〉</span>
              </div>
            `;
          });
        }
      });

      tripList.innerHTML = html;

    } catch (err) {
      console.error("여행 목록 로드 실패:", err);
      tripList.innerHTML = "<p style='color: #ef4444; text-align: center; padding: 20px;'>여행 목록을 불러올 수 없습니다.<br>네트워크 접속 상태를 확인해 주세요.</p>";
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
    
    // 화면 전환 (목록 숨기고 상세 표시)
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
              <div class="place" style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 14px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                  <h4 onclick="openPlaceDetailByIndex(${dayIdx}, ${placeIdx})" style="margin: 0; color: #2563eb; cursor: pointer; font-size: 16px; display: flex; flex-direction: column; gap: 4px;">
                    <span>📍 ${nameKr} <span style="font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bfdbfe; margin-left: 4px;">상세보기 〉</span></span>
                    ${nameCn ? `<span style="font-size: 13px; color: #64748b; font-weight: normal;">${nameCn} ${nameEn ? `(${nameEn})` : ''}</span>` : ''}
                  </h4>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #f1f5f9;">
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

// 문서 로딩 완료 시 실행
document.addEventListener("DOMContentLoaded", () => {
  console.log("trip.js 로드 완료 - 여행 목록 자동 검증 시작");
  loadTrips();
});